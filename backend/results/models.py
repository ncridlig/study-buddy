from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from topics.models import Topic
import datetime


def file_upload_path(instance, filename):
    user = instance.topic.user
    topic_title = instance.topic.title.replace(' ', '_')
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"results/user_{user.id}/{topic_title}/QA_{topic_title}_{timestamp}.md"

class QAGenerationTask(models.Model):
    class Status(models.TextChoices):
        PENDING    = settings.PENDING, _('Pending')
        PROCESSING = settings.PROCESSING, _('Processing')
        SUCCESS    = settings.SUCCESS, _('Success')
        FAILED     = settings.FAILED, _('Failed')

    topic = models.ForeignKey(
        Topic,
        on_delete=models.PROTECT,
        related_name='qa_tasks',
        verbose_name=_('Topic')
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name=_('Status')
    )
    result_file = models.FileField(
        upload_to=file_upload_path,
        null=True, blank=True,
        verbose_name=_('Result File (Markdown)')
    )
    error_message = models.TextField(blank=True, null=True, verbose_name=_('Error Message'))

    created = models.DateTimeField(auto_now_add=True, verbose_name=_('Created'))
    updated = models.DateTimeField(auto_now=True, verbose_name=_('Updated'))

    class Meta:
        verbose_name = _('Q&A Generation Task')
        verbose_name_plural = _('Q&A Generation Tasks')
        ordering = ['-created']

        # This ensures that only one active Q&A task (PENDING or PROCESSING) can exist per topic at any given time
        constraints = [
            models.UniqueConstraint(
                fields=['topic'],
                condition=models.Q(status__in=['PENDING', 'PROCESSING']),
                name='only_one_active_qa_task_per_topic'
            )
        ]

    def __str__(self):
        return f"Task {self.id} for topic '{self.topic.title}' ({self.status})"
