from rest_framework_nested import routers
from rest_framework.routers import DefaultRouter
from topics import views


app_name = 'topics'


router = DefaultRouter()
router.register('topics', views.TopicViewSet, basename='topic')

topics_router = routers.NestedDefaultRouter(router, 'topics', lookup='topic')
topics_router.register('files', views.UploadedFileViewSet, basename='topic-files')

urlpatterns = []

urlpatterns += router.urls
urlpatterns += topics_router.urls