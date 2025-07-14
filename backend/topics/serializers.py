from rest_framework import serializers
from django.conf import settings
from django.db import IntegrityError
from django.db.models import Max
from topics.models import Topic, UploadedFile
import os



class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        ref_name = None
        model = Topic
        fields = ['id', 'title', 'description']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        try:
            return super().create(validated_data)
        except IntegrityError as e:
            if 'unique_user_topic_title_if_not_archived' in str(e):
                raise serializers.ValidationError({
                    "Error": "You already have a topic with this title."
                })
            raise e


class UploadedFileSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    download_link = serializers.SerializerMethodField()

    def get_download_link(self, obj):
        return self.context['request'].build_absolute_uri(obj.file.url)

    class Meta:
        ref_name = None
        model = UploadedFile
        fields = ['id', 'file', 'filename', 'download_link', 'order']
        read_only_fields = ['filename']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        request = self.context.get('request')
        if request and request.method == 'PATCH':
            self.fields['file'].required = False

    def validate(self, attrs):
        topic = attrs.get('topic')
        file = attrs.get('file')
        order = attrs.get('order')

        # ✅ Enforce max number of files per topic
        if not self.instance:  # Only for create
            if UploadedFile.objects.filter(topic=topic).count() >= settings.ALLOWED_NUMBER_OF_FILES:
                raise serializers.ValidationError({
                    'Error': f'This topic already has the maximum of {settings.ALLOWED_NUMBER_OF_FILES} files.'
                })

        # ✅ Enforce max file size
        if file and file.size > settings.ALLOWED_FILE_SIZE:
            raise serializers.ValidationError({
                'Error': f'File size exceeds {settings.ALLOWED_FILE_SIZE / 1024 / 1024:.1f} MB limit.'
            })

        # ✅ Enforce allowed file extensions
        if file:
            ext = os.path.splitext(file.name)[1].lower()
            if ext not in settings.ALLOWED_FILE_TYPES:
                raise serializers.ValidationError({
                    'Error': f'File type “{ext}” is not allowed. Allowed types: {", ".join(settings.ALLOWED_FILE_TYPES)}'
                })

        # ✅ Enforce unique order (manual)
        if order is not None:
            query = UploadedFile.objects.filter(topic=topic, order=order)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)
            if query.exists():
                raise serializers.ValidationError({
                    'Error': f'Order {order} is already used in this topic.'
                })

        return attrs

    def create(self, validated_data):
        uploaded_file = validated_data['file']
        validated_data['filename'] = uploaded_file.name

        if 'order' not in validated_data:
            topic = validated_data['topic']
            last_order = UploadedFile.objects.filter(topic=topic).aggregate(
                max_order=Max('order')
            )['max_order']
            validated_data['order'] = 0 if last_order is None else last_order + 1

        try:
            return super().create(validated_data)
        except IntegrityError as e:
            return self._handle_integrity_error(e)

    def update(self, instance, validated_data):
        try:
            if not validated_data:
                return instance

            if 'order' in validated_data:
                instance.order = validated_data['order']
            if 'file' in validated_data:
                file_obj = validated_data['file']
                instance.file = file_obj
                instance.filename = file_obj.name

            instance.save()
            return instance
        except IntegrityError as e:
            return self._handle_integrity_error(e)

    def _handle_integrity_error(self, e):
        msg = str(e)
        if 'unique_order_per_topic' in msg:
            raise serializers.ValidationError({
                'Error': 'This order value is already taken in this topic.'
            })
        raise e
