from django.urls import path
from .views import ReportsOverviewView

urlpatterns = [
    path('reports/', ReportsOverviewView.as_view(), name='reports_overview'),
]
