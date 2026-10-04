from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    LogoutView,
    MeView,
    HeartbeatView,
    UserViewSet,
    UserMonitoringListView,
    LoginHistoryListView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/heartbeat/', HeartbeatView.as_view(), name='auth_heartbeat'),

    # Monitoring & History
    path('monitoring/', UserMonitoringListView.as_view(), name='user_monitoring'),
    path('login-history/', LoginHistoryListView.as_view(), name='login_history'),

    # User Management CRUD
    path('', include(router.urls)),
]
