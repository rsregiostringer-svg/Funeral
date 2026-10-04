from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Alaala Funeral Homes REST API
    path('api/', include('accounts.urls')),
    path('api/', include('funeral_cases.urls')),
    path('api/', include('activity_logs.urls')),
    path('api/', include('dashboard.urls')),
    path('api/', include('reports.urls')),
]
