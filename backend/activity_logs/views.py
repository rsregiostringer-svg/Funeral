from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from .models import ActivityLog
from .serializers import ActivityLogSerializer
from accounts.permissions import IsMasterAdmin


class ActivityLogPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class ActivityLogListView(APIView):
    """
    Immutable user activity logs.
    Accessible exclusively to Master Admin.
    """
    permission_classes = [permissions.IsAuthenticated, IsMasterAdmin]

    def get(self, request):
        qs = ActivityLog.objects.all().order_by('-created_at')

        action_param = request.query_params.get('action')
        username = request.query_params.get('username')
        search = request.query_params.get('search')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if action_param:
            qs = qs.filter(action=action_param)
        if username:
            qs = qs.filter(username__icontains=username)
        if search:
            qs = qs.filter(
                Q(related_record__icontains=search) |
                Q(details__icontains=search) |
                Q(username__icontains=search)
            )
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        paginator = ActivityLogPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ActivityLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
