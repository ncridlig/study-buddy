from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_POST
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
@require_POST
def llm_callback(request):
    try:
        data = json.loads(request.body)
        success = data.get("success")
        task_id = data.get("task_id")

        try:
            task = QAGenerationTask.objects.select_related('topic__user').get(id=task_id)
        except QAGenerationTask.DoesNotExist:
            return JsonResponse({"Message": _("Task not found")}, status=404)
        
        # should not happen in normal flow
        if task.status != settings.PROCESSING:
            return JsonResponse({"Message": _("Task is not in PROCESSING state.")}, status=409)

        if success:
            markdown = data.get("markdown_content")

            # Should not happen in normal flow
            if not markdown:
                return JsonResponse({"Message": _("Missing markdown_content")}, status=400)
            
            task.result_file.save("dummy.md", ContentFile(markdown))
            task.status = settings.SUCCESS
            task.save()
            message, status_code = _("Success"), 200

            # LLM-service should remove task-id after processing
            return JsonResponse({"Message": message}, status=status_code)
        else:
            error_message = data.get("error_message")

            # Should not happen in normal flow
            if not error_message:
                return JsonResponse({"Message": _("Missing error_message")}, status=400)
            
            task.error_message = error_message
            task.status = settings.FAILED
            task.save()
            message, status_code = _("Success"), 200

        notify_task_status(task)
        return JsonResponse({"Message": message}, status=status_code)

    except Exception as e:
        # Optionally notify via Django Channels here
        return JsonResponse({"Message": str(e)}, status=500)



# @swagger_auto_schema(**schemas['LLM_CALLBACK_SCHEMA']['POST'])
# @api_view(['POST'])
# @csrf_exempt
# @require_POST
# def llm_callback(request):
#     try:
#         data = json.loads(request.body)
#         task_id = data.get("task_id")
#         markdown = data.get("markdown_content")

#         if not task_id or not markdown:
#             return JsonResponse({"Message": _("Missing task_id or markdown_content")}, status=400)

#         try:
#             task = QAGenerationTask.objects.select_related('topic__user').get(id=task_id)
#         except QAGenerationTask.DoesNotExist:
#             return JsonResponse({"Message": _("Task not found")}, status=404)
        
#         # ✅ Only allow callback if task is in PROCESSING
#         # This should not happen in normal flow, since LLM-service removes task-ids after processing
#         if task.status != settings.PROCESSING:
#             return JsonResponse({"Message": _("Task is not in PROCESSING state.")}, status=409)
        
#         try:
#             task.result_file.save("dummy.md", ContentFile(markdown))
#             task.status = settings.SUCCESS
#             task.save()
#             message, status_code = _("Success"), 200

#         except Exception as e:
#             error_msg = f"Failed to save markdown file: {str(e)}"
#             task.error_message = error_msg
#             task.status = settings.FAILED
#             task.save()
#             message, status_code = str(e), 500

#         notify_task_status(task)
#         return JsonResponse({"Message": message}, status=status_code)

#     except Exception as e:
#         # Optionally notify via Django Channels here
#         return JsonResponse({"Message": str(e)}, status=500)


