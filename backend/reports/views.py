import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, renderers
from django.utils import timezone
from django.db.models import Count, Sum

from funeral_cases.models import FuneralCase
from accounts.permissions import IsAdminOrMasterAdmin
from activity_logs.models import record_activity, ActivityLog


class PassthroughCSVRenderer(renderers.BaseRenderer):
    media_type = 'text/csv'
    format = 'csv'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class ReportsOverviewView(APIView):
    """
    Returns aggregated metrics and downloadable reports for funeral cases.
    Logs each report download to immutable ActivityLog.
    Accessible to Master Admin and Admin users.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrMasterAdmin]
    renderer_classes = [renderers.JSONRenderer, renderers.BrowsableAPIRenderer, PassthroughCSVRenderer]

    def get(self, request):
        qs = FuneralCase.objects.filter(is_deleted=False)

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        status_param = request.query_params.get('case_status')
        service_type = request.query_params.get('service_type')
        format_param = request.query_params.get('format', 'json').lower()

        if start_date:
            qs = qs.filter(date_of_passing__gte=start_date)
        if end_date:
            qs = qs.filter(date_of_passing__lte=end_date)
        if status_param:
            qs = qs.filter(case_status=status_param)
        if service_type:
            qs = qs.filter(service_type=service_type)

        # Handle CSV Export
        if format_param == 'csv':
            record_activity(
                request=request,
                action=ActivityLog.ACTION_REPORT_DOWNLOADED,
                related_record="Funeral Cases CSV Report",
                details=f"Downloaded report covering {qs.count()} cases (Filters: status={status_param or 'All'}, service={service_type or 'All'})"
            )

            filename = f"Alaala_Funeral_Cases_Report_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            writer = csv.writer(response)
            # Header
            writer.writerow([
                'Case Number',
                'BIR Code Receipt',
                'Deceased Full Name (Last, First Middle)',
                'Deceased Last Name',
                'Deceased First Name',
                'Deceased Middle Name',
                'Gender',
                'Age',
                'Date of Passing',
                'Informant Full Name (Last, First Middle)',
                'Informant Last Name',
                'Informant First Name',
                'Informant Middle Name',
                'Informant Contact',
                'Relationship',
                'Service Type',
                'Chapel Room',
                'Casket / Urn',
                'Cemetery / Columbarium',
                'Case Status',
                'Total Amount (PHP)',
                'Date Created',
            ])

            for case in qs.order_by('-date_of_passing'):
                writer.writerow([
                    case.case_number,
                    case.bir_receipt_number or '—',
                    case.deceased_name,
                    case.deceased_last_name or '—',
                    case.deceased_first_name or '—',
                    case.deceased_middle_name or '—',
                    case.gender,
                    case.age or '',
                    case.date_of_passing.strftime('%Y-%m-%d') if case.date_of_passing else '',
                    case.informant_name,
                    case.informant_last_name or '—',
                    case.informant_first_name or '—',
                    case.informant_middle_name or '—',
                    case.informant_contact,
                    case.informant_relationship,
                    case.service_type,
                    case.chapel_room,
                    case.casket_or_urn,
                    case.cemetery_or_columbarium,
                    case.get_case_status_display(),
                    f"{case.total_amount:.2f}",
                    case.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                ])

            return response

        # Otherwise JSON Summary
        total_count = qs.count()
        total_revenue = qs.aggregate(sum=Sum('total_amount'))['sum'] or 0.0

        by_status = list(
            qs.values('case_status')
            .annotate(count=Count('id'), total=Sum('total_amount'))
            .order_by('-count')
        )
        by_service = list(
            qs.values('service_type')
            .annotate(count=Count('id'), total=Sum('total_amount'))
            .order_by('-count')
        )

        cases_summary = []
        for c in qs.order_by('-created_at')[:50]:
            cases_summary.append({
                'id': c.id,
                'case_number': c.case_number,
                'deceased_name': c.deceased_name,
                'date_of_passing': c.date_of_passing.strftime('%Y-%m-%d') if c.date_of_passing else None,
                'informant_name': c.informant_name,
                'service_type': c.service_type,
                'case_status': c.case_status,
                'status_display': c.get_case_status_display(),
                'total_amount': float(c.total_amount),
                'created_at': c.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            })

        return Response({
            'total_cases': total_count,
            'total_revenue': float(total_revenue),
            'by_status': by_status,
            'by_service': by_service,
            'recent_records': cases_summary,
            'filters': {
                'start_date': start_date,
                'end_date': end_date,
                'case_status': status_param,
                'service_type': service_type,
            }
        })
