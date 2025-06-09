from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

import os


User = get_user_model()


class Topic(models.Model):
    user = models.ForeignKey(
            User, on_delete=models.PROTECT,
            related_name='topics', verbose_name=_('User')
            )
    title = models.CharField(max_length=100, verbose_name=_('Title'))
    description = models.TextField(verbose_name=_('Description'), blank=True)

    created = models.DateTimeField(auto_now_add=True, verbose_name=_('Created'))
    updated = models.DateTimeField(auto_now=True, verbose_name=_('Updated'))

    class Meta :
        verbose_name = _('Topic')
        verbose_name_plural = _('Topics')
        ordering = ('created',)
        constraints = [
            models.UniqueConstraint(fields=['user', 'title'], name='unique_user_topic_title')
        ]

    def __str__(self):
        return self.title


def file_upload_path(instance, filename):
    user = instance.topic.user
    topic_title = instance.topic.title.replace(' ', '_')
    return f"files/user_{user.id}/{topic_title}/{filename}"

class UploadedFile(models.Model):
    topic = models.ForeignKey(
        'Topic',
        on_delete=models.PROTECT,
        related_name='files',
        verbose_name=_('Topic')
    )
    file = models.FileField(upload_to=file_upload_path, verbose_name=_('File'))
    filename = models.CharField(max_length=255, verbose_name=_('Filename')) 
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))

    created = models.DateTimeField(auto_now_add=True, verbose_name=_('Created'))
    updated = models.DateTimeField(auto_now=True, verbose_name=_('Updated'))

    class Meta:
        verbose_name = _('Uploaded File')
        verbose_name_plural = _('Uploaded Files')
        ordering = ['created']
        constraints = [
            # Two files cannot have the same order in the same topic
            models.UniqueConstraint(fields=['topic', 'order'], name='unique_order_per_topic'),
        ]

    def __str__(self):
        return os.path.basename(self.filename)
