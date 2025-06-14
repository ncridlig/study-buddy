from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from results.models import QAGenerationTask
from results.serializers import QAGenerationTaskCreateSerializer


class QAGenerationTaskCreateAPIView(
                        generics.ListAPIView, 
                        generics.CreateAPIView
                        ):

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return QAGenerationTask.objects.none()
        return QAGenerationTask.objects.filter(topic__user=self.request.user)
        
    serializer_class = QAGenerationTaskCreateSerializer
    permission_classes = [IsAuthenticated, ]

