from rest_framework_nested import routers
from results import views
from django.urls import path



app_name = 'results'

urlpatterns = [
    path('qa/', views.QAGenerationTaskCreateAPIView.as_view(), name='qa-task-list-create'),
    path('qa/<int:pk>/', views.QAGenerationTaskRetrieveAPIView.as_view(), name='qa-task-retrieve'),
    path("llm_callback/", views.llm_callback, name="llm_callback"),
]
