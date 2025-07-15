from rest_framework import serializers
from django.db import IntegrityError
from results.models import QAGenerationTask
from results.tasks import send_to_llm_service


class QAGenerationTaskCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = QAGenerationTask
        fields = ['id', 'topic', 'status']
        read_only_fields = ['id', 'status']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.result_file:
            date_str = instance.created.strftime("%d.%m.%Y").replace('.', '-')
            topic_title = instance.topic.title.replace('.', '-').replace(' ', '-')
            representation['name'] = f'{topic_title}_{date_str}.md'
            representation['result_file'] = instance.result_file.url
        else:
            representation['result_file'] = "Q&A generation in progress"

        return representation

    def create(self, validated_data):
        try :
            task = super().create(validated_data)
        except IntegrityError as e:
            if 'only_one_active_qa_task_per_topic' in str(e):
                raise serializers.ValidationError({
                    'Error': 'A Q&A generation task is already in progress for this topic.'
                })
            raise e

        send_to_llm_service.delay(task.id)
        return task