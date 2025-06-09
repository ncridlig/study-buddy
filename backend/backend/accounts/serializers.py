from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _



User = get_user_model()


class RegisterUserSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        ref_name = None
        model = User
        fields = ('email', 'firstname', 'lastname', 'password', 'confirm_password', )

        extra_kwargs = {
            'password': {
                'write_only' : True,
                'style' : {'input_type' : 'password'},
            },
            'confirm_password': {
                'write_only' : True,
                'style' : {'input_type' : 'password'},
            }
        }

    def validate(self, data) :
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError(_("Passwords do not match"))
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        return User.objects.create_user(**validated_data)


class PasswordChangeSerializer(serializers.Serializer):

    class Meta:
        ref_name = None

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_repeat = serializers.CharField(required=True, write_only=True)

    def validate(self, data) :
        user = self.context['request'].user

        if user is None:
            raise serializers.ValidationError(_("Bad Request"))

        if not user.check_password(data['old_password']) :
            raise serializers.ValidationError(_("Bad Request"))

        if data['new_password'] != data['new_password_repeat']:
            raise serializers.ValidationError(_("Passwords do not match"))
        
        # validate_password(data['new_password'])

        data['user'] = user
        return data

    def save(self) :
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
