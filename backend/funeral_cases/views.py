from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.utils import timezone

from .models import FuneralCase
from .serializers import FuneralCaseSerializer
from accounts.permissions import CanDeleteRecord, CanEditRecord
from activity_logs.models import record_activity, ActivityLog


class FuneralCaseViewSet(viewsets.ModelViewSet):
    """
    Funeral Case Management ViewSet.
    - Adding / Creating and Viewing deceased and family records: Accessible to Staff, Admin, and Master Admin.
    - Editing / Updating deceased and family records: Restricted exclusively to Master Admin.
    - DELETION: Restricted exclusively to Master Admin.
    """
    serializer_class = FuneralCaseSerializer
    permission_classes = [permissions.IsAuthenticated, CanDeleteRecord, CanEditRecord]

    def get_queryset(self):
        user = self.request.user
        qs = FuneralCase.objects.all().order_by('-created_at')

        # Filter out soft-deleted cases unless Master Admin requests them explicitly
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        if not (include_deleted and user.is_master_admin):
            qs = qs.filter(is_deleted=False)

        # Filters
        search = self.request.query_params.get('search')
        status_param = self.request.query_params.get('case_status')
        service_type = self.request.query_params.get('service_type')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if search:
            search = search.strip()
            qs = qs.filter(
                Q(case_number__icontains=search) |
                Q(deceased_name__icontains=search) |
                Q(deceased_last_name__icontains=search) |
                Q(deceased_first_name__icontains=search) |
                Q(informant_name__icontains=search) |
                Q(informant_last_name__icontains=search) |
                Q(informant_first_name__icontains=search) |
                Q(chapel_room__icontains=search) |
                Q(bir_receipt_number__icontains=search)
            )

        if status_param:
            qs = qs.filter(case_status=status_param)

        if service_type:
            qs = qs.filter(service_type=service_type)

        if date_from:
            qs = qs.filter(date_of_passing__gte=date_from)

        if date_to:
            qs = qs.filter(date_of_passing__lte=date_to)

        return qs

    def perform_create(self, serializer):
        case = serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user
        )
        record_activity(
            request=self.request,
            action=ActivityLog.ACTION_CASE_CREATED,
            related_record=f"Case: {case.case_number}",
            details=f"Created case for deceased: {case.deceased_name} ({case.service_type})"
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        record_activity(
            request=request,
            action=ActivityLog.ACTION_CASE_VIEWED,
            related_record=f"Case: {instance.case_number}",
            details=f"Viewed case details for {instance.deceased_name}"
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        if not (request.user.is_master_admin or request.user.is_admin_user):
            return Response(
                {'detail': 'Staff accounts are only permitted to add and view records. Editing requires Admin or Master Admin privileges.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not (request.user.is_master_admin or request.user.is_admin_user):
            return Response(
                {'detail': 'Staff accounts are only permitted to add and view records. Editing requires Admin or Master Admin privileges.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        case = serializer.save(updated_by=self.request.user)
        record_activity(
            request=self.request,
            action=ActivityLog.ACTION_CASE_UPDATED,
            related_record=f"Case: {case.case_number}",
            details=f"Updated case details for {case.deceased_name} (Status: {case.get_case_status_display()})"
        )

    def destroy(self, request, *args, **kwargs):
        # Strict enforcement: Only Master Admin can delete records
        if not request.user.is_master_admin:
            return Response(
                {'detail': 'Only Master Admin has permission to delete funeral records.'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()
        case_number = instance.case_number
        deceased_name = instance.deceased_name

        # Perform soft delete
        instance.soft_delete(request.user)

        record_activity(
            request=request,
            action=ActivityLog.ACTION_CASE_DELETED,
            related_record=f"Case: {case_number}",
            details=f"Deleted case record for {deceased_name}"
        )

        return Response(
            {'message': 'Record deleted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='search')
    def search_cases(self, request):
        """
        Global and dedicated Case Number / Deceased search endpoint.
        Returns real database records.
        """
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'results': [], 'count': 0})

        qs = FuneralCase.objects.filter(is_deleted=False).filter(
            Q(case_number__icontains=q) |
            Q(deceased_name__icontains=q) |
            Q(deceased_last_name__icontains=q) |
            Q(deceased_first_name__icontains=q) |
            Q(informant_name__icontains=q) |
            Q(bir_receipt_number__icontains=q)
        ).order_by('-created_at')[:20]

        record_activity(
            request=request,
            action=ActivityLog.ACTION_CASE_SEARCHED,
            related_record=f"Search: '{q}'",
            details=f"Found {qs.count()} matching records"
        )

        serializer = self.get_serializer(qs, many=True)
        return Response({
            'query': q,
            'count': qs.count(),
            'results': serializer.data
        })
