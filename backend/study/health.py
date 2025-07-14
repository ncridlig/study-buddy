from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(
    method='get',
    operation_summary="Health check endpoint",
    operation_description="Returns a simple health status response to indicate the service is running.",
    responses={200: openapi.Response(description="OK")}
)
@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})