from rest_framework_nested import routers
from results.views import QAGenerationTaskCreateAPIView, llm_callback
from django.urls import path



app_name = 'results'

urlpatterns = [
    path('qa/', QAGenerationTaskCreateAPIView.as_view(), name='questions-answers'),
    path("llm_callback/", llm_callback, name="llm_callback"),
]
