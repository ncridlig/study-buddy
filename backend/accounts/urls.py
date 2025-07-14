from django.urls import path
from accounts import views


app_name = 'accounts'

urlpatterns = [
    path('user/', views.RegisterAPIView.as_view(), name='api-user'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    # path('api/change/password/', views.PasswordChangeAPIView.as_view(), name='api-change-password'),
]