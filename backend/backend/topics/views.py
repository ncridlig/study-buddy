from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from topics.models import Topic, UploadedFile
from topics.serializers import TopicSerializer, UploadedFileSerializer
from topics.docs import schemas

from drf_yasg.utils import swagger_auto_schema


class TopicViewSet(ModelViewSet):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch']
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Topic.objects.none()  # Return empty queryset during schema generation

        return Topic.objects.filter(user=self.request.user)
    
    @swagger_auto_schema(**schemas['TopicViewSetSchema']['CREATE'])
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['TopicViewSetSchema']['LIST'])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['TopicViewSetSchema']['RETRIEVE'])
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['TopicViewSetSchema']['UPDATE'])
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)


class UploadedFileViewSet(ModelViewSet):
    serializer_class = UploadedFileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):

        if getattr(self, 'swagger_fake_view', False):
            return UploadedFile.objects.none()  # Return empty queryset during schema generation

        topic_id = self.kwargs['topic_pk']
        try:
            topic = Topic.objects.get(pk=topic_id, user=self.request.user)
        except Topic.DoesNotExist:
            raise PermissionDenied("You do not have access to this topic.")
        return UploadedFile.objects.filter(topic=topic)

    def perform_create(self, serializer):
        topic_id = self.kwargs['topic_pk']
        try:
            topic = Topic.objects.get(pk=topic_id, user=self.request.user)
        except Topic.DoesNotExist:
            raise PermissionDenied("You do not have access to this topic.")
        serializer.save(topic=topic)

    @swagger_auto_schema(**schemas['UploadedFileViewSetSchema']['CREATE'])
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['UploadedFileViewSetSchema']['UPDATE'])
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['UploadedFileViewSetSchema']['LIST'])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['UploadedFileViewSetSchema']['RETRIEVE'])
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['UploadedFileViewSetSchema']['DELETE'])
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
