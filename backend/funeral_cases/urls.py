from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FuneralCaseViewSet

router = DefaultRouter()
router.register(r'cases', FuneralCaseViewSet, basename='funeral_case')

urlpatterns = [
    path('', include(router.urls)),
]
