from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from results.models import QAGenerationTask
from results.serializers import QAGenerationTaskCreateSerializer
from django.conf import settings
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_POST
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


@csrf_exempt
@require_POST
def llm_callback(request):
    print("🔍 Incoming Host Header:", request.get_host()) 
    try:
        data = json.loads(request.body)
        task_id = data.get("task_id")
        markdown = data.get("markdown_content")

        if not task_id or not markdown:
            return JsonResponse({"error": "Missing task_id or markdown_content"}, status=400)

        try:
            task = QAGenerationTask.objects.select_related('topic__user').get(id=task_id)
        except QAGenerationTask.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)
        
        # ✅ Only allow callback if task is in PROCESSING
        # This should not happen in normal flow, since LLM-service removes task-ids after processing
        if task.status != "PROCESSING":
            return JsonResponse({"error": "Task is not in PROCESSING state."}, status=409)
        
        try:
            task.result_file.save("dummy.md", ContentFile(markdown))
            task.status = settings.SUCCESS
            task.save()
            # Optionally notify via Django Channels here
            return JsonResponse({"ok": True})
        except Exception as e:
            error_msg = f"Failed to save markdown file: {str(e)}"
            task.error_message = error_msg
            task.status = settings.FAILED
            task.save()

            # Optionally notify via Django Channels here
            JsonResponse({"error": str(e)}, status=500)

    except Exception as e:
        # Optionally notify via Django Channels here
        return JsonResponse({"error": str(e)}, status=500)


