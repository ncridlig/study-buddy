from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import transaction
from drf_yasg.utils import swagger_auto_schema
from results.models import QAGenerationTask
from results.serializers import QAGenerationTaskCreateSerializer
from results.utils import notify_task_status
from results.docs import schemas
import json


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

    @swagger_auto_schema(**schemas['QAGenerationTaskAPIViewSchema']['LIST'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @swagger_auto_schema(**schemas['QAGenerationTaskAPIViewSchema']['CREATE'])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class QAGenerationTaskRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = QAGenerationTaskCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return QAGenerationTask.objects.none()
        return QAGenerationTask.objects.filter(topic__user=self.request.user)
    
    @swagger_auto_schema(**schemas['QAGenerationTaskAPIViewSchema']['RETRIEVE'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@swagger_auto_schema(**schemas['LLM_CALLBACK_SCHEMA']['POST'])
@api_view(['POST'])
def llm_callback(request):

    data = request.data
    task_id = data.get("task_id")

    try:
        if not task_id:
            return JsonResponse({"Message": _("Missing task_id")}, status=400)
        
        try:
            task = QAGenerationTask.objects.select_related('topic__user').get(id=task_id)
        except QAGenerationTask.DoesNotExist:
            return JsonResponse({"Message": _("Task not found")}, status=404)
        
        # should not happen in normal flow
        if task.status != settings.PROCESSING:
            return JsonResponse({"Message": _("Task is not in PROCESSING state.")}, status=409)
        
        if "markdown_content" in data:
            markdown = data["markdown_content"]

            with transaction.atomic():
                task.result_file.save(f"task_{task.id}_question-answer.md", ContentFile(markdown))
                task.status = settings.SUCCESS
                task.error_message = ""
                task.save()
                notify_task_status(task)

            return JsonResponse({"Message": "Success"}, status=200)
        
        elif "error_message" in data:
            error_message = data["error_message"]
            
            with transaction.atomic():
                task.error_message = error_message
                task.status = settings.FAILED
                task.save()
                notify_task_status(task)

            # The client's request was valid, even if the job failed.
            return JsonResponse({"Message": "Failure logged successfully"}, status=200)
        
        else:
            return JsonResponse({"Message": _("Invalid payload: Missing 'markdown_content' or 'error_message'")}, status=400)
        
    except Exception as e:
        # If an unexpected error happens, try to fail the task so you know about it.
        if 'task' in locals() and task:
            task.status = settings.FAILED
            task.error_message = f"Unexpected callback processing error: {str(e)}"
            task.save()
            notify_task_status(task)
        
        return JsonResponse({"Message": str(e)}, status=500)