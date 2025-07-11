from storages.backends.gcloud import GoogleCloudStorage
from django.conf import settings

class MediaRootGoogleCloudStorage(GoogleCloudStorage):
    bucket_name = settings.GS_BUCKET_MEDIA_NAME