from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from topics.models import UploadedFile


@receiver(post_delete, sender=UploadedFile)
def delete_file_on_instance_delete(sender, instance, **kwargs):
    if instance.file and instance.file.storage.exists(instance.file.name):
        instance.file.delete(save=False)

@receiver(pre_save, sender=UploadedFile)
def delete_old_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_instance = UploadedFile.objects.get(pk=instance.pk)
    except UploadedFile.DoesNotExist:
        return

    old_file = old_instance.file
    new_file = instance.file

    if old_file and old_file.name != new_file.name:
        if old_file.storage.exists(old_file.name):
            old_file.storage.delete(old_file.name)
