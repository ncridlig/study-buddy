from rest_framework_nested import routers
from results.views import QAGenerationTaskCreateAPIView
from django.urls import path



app_name = 'results'

urlpatterns = [
    path('api/qa/', QAGenerationTaskCreateAPIView.as_view(), name='questions-answers'),
]
