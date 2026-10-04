from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

from .models import User, LoginHistory, SystemSetting
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ResetPasswordSerializer,
    LoginHistorySerializer,
    UserMonitoringSerializer,
)
from .permissions import IsMasterAdmin, IsAdminOrMasterAdmin, CanManageUser
from activity_logs.models import (
    record_activity,
    get_client_ip,
    get_client_agent_details,
    ActivityLog,
)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        agent_info = get_client_agent_details(request)
        ip = get_client_ip(request)

        user = authenticate(username=username, password=password)

        if not user:
            # Check if user exists but inactive
            existing_user = User.objects.filter(username__iexact=username).first()
            if existing_user and existing_user.status == User.STATUS_INACTIVE:
                # Log failed login attempt
                LoginHistory.objects.create(
                    user=existing_user,
                    username_attempted=username,
                    role=existing_user.role,
                    status=LoginHistory.STATUS_FAILED,
                    ip_address=ip,
                    user_agent=agent_info['user_agent'],
                    browser=agent_info['browser'],
                    device=agent_info['device'],
                )
                return Response(
                    {'detail': 'This account has been deactivated. Please contact an administrator.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Log bad credentials
            LoginHistory.objects.create(
                user=existing_user if existing_user else None,
                username_attempted=username,
                role=existing_user.role if existing_user else 'UNKNOWN',
                status=LoginHistory.STATUS_FAILED,
                ip_address=ip,
                user_agent=agent_info['user_agent'],
                browser=agent_info['browser'],
                device=agent_info['device'],
            )
            return Response(
                {'detail': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if user.status == User.STATUS_INACTIVE or not user.is_active:
            LoginHistory.objects.create(
                user=user,
                username_attempted=username,
                role=user.role,
                status=LoginHistory.STATUS_FAILED,
                ip_address=ip,
                user_agent=agent_info['user_agent'],
                browser=agent_info['browser'],
                device=agent_info['device'],
            )
            return Response(
                {'detail': 'This account has been deactivated. Please contact an administrator.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Successful Login
        now = timezone.now()
        user.last_login = now
        user.last_active = now
        user.save(update_fields=['last_login', 'last_active'])

        # Create Login History
        history = LoginHistory.objects.create(
            user=user,
            username_attempted=username,
            role=user.role,
            login_time=now,
            last_active=now,
            status=LoginHistory.STATUS_SUCCESS,
            ip_address=ip,
            user_agent=agent_info['user_agent'],
            browser=agent_info['browser'],
            device=agent_info['device'],
        )

        # Log Activity
        record_activity(
            request=request,
            action=ActivityLog.ACTION_LOGIN,
            related_record=f"User: {user.username}",
            details=f"Successful login via {agent_info['browser']} on {agent_info['device']}",
            user=user
        )

        # Generate Tokens
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name
        refresh['username'] = user.username

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'message': 'Login successful.'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        refresh_token = request.data.get('refresh')

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        now = timezone.now()
        # Update latest login history record
        latest_history = LoginHistory.objects.filter(user=user, status=LoginHistory.STATUS_SUCCESS).first()
        if latest_history:
            latest_history.logout_time = now
            latest_history.status = LoginHistory.STATUS_LOGGED_OUT
            latest_history.save(update_fields=['logout_time', 'status'])

        # Log Activity
        record_activity(
            request=request,
            action=ActivityLog.ACTION_LOGOUT,
            related_record=f"User: {user.username}",
            details="User logged out manually",
            user=user
        )

        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class HeartbeatView(APIView):
    """
    Called periodically by the frontend.
    Updates user last_active and allows tracking active vs idle states.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        now = timezone.now()
        is_client_idle = request.data.get('is_idle', False)

        user.last_active = now
        user.save(update_fields=['last_active'])

        # Also update last_active on the current login history record
        latest_history = LoginHistory.objects.filter(user=user, status=LoginHistory.STATUS_SUCCESS).first()
        if latest_history:
            latest_history.last_active = now
            latest_history.save(update_fields=['last_active'])

        return Response({
            'status': 'ok',
            'server_time': now.isoformat(),
            'idle_state': 'idle' if is_client_idle else 'active'
        })


class UserViewSet(viewsets.ModelViewSet):
    """
    User Management:
    - Master Admin has exclusive access to create, view, edit, activate, deactivate, and manage all accounts.
    - Regular Admin and Staff cannot access this endpoint.
    """
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated, IsMasterAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search')
        role_filter = self.request.query_params.get('role')
        status_filter = self.request.query_params.get('status')

        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(username__icontains=search) |
                Q(email__icontains=search)
            )
        if role_filter:
            qs = qs.filter(role=role_filter)
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs

    def perform_create(self, serializer):
        user = serializer.save()
        record_activity(
            request=self.request,
            action=ActivityLog.ACTION_USER_CREATED,
            related_record=f"User: {user.username}",
            details=f"Created user {user.full_name} with role {user.role}"
        )

    def perform_update(self, serializer):
        user = serializer.save()
        record_activity(
            request=self.request,
            action=ActivityLog.ACTION_USER_EDITED,
            related_record=f"User: {user.username}",
            details=f"Updated details for {user.full_name} ({user.role})"
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Strict Master Admin protection
        if instance.is_master_admin:
            return Response(
                {'detail': 'Master Admin accounts are protected and cannot be deleted.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = instance.username
        full_name = instance.full_name
        role = instance.role

        self.perform_destroy(instance)

        record_activity(
            request=request,
            action=ActivityLog.ACTION_USER_DELETED,
            related_record=f"User: {username}",
            details=f"Deleted user account: {full_name} ({role})"
        )

        return Response(
            {'message': 'Record deleted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        user = self.get_object()
        user.status = User.STATUS_ACTIVE
        user.is_active = True
        user.save(update_fields=['status', 'is_active'])

        record_activity(
            request=request,
            action=ActivityLog.ACTION_USER_ACTIVATED,
            related_record=f"User: {user.username}",
            details=f"Activated account for {user.full_name}"
        )
        return Response(
            {'message': 'User activated successfully.', 'user': UserSerializer(user).data},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        user = self.get_object()

        # Master Admin can never be deactivated
        if user.is_master_admin:
            return Response(
                {'detail': 'Master Admin accounts cannot be deactivated.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.status = User.STATUS_INACTIVE
        user.is_active = False
        user.save(update_fields=['status', 'is_active'])

        record_activity(
            request=request,
            action=ActivityLog.ACTION_USER_DEACTIVATED,
            related_record=f"User: {user.username}",
            details=f"Deactivated account for {user.full_name}"
        )
        return Response(
            {'message': 'User deactivated successfully.', 'user': UserSerializer(user).data},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        user = self.get_object()

        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])

        record_activity(
            request=request,
            action=ActivityLog.ACTION_PASSWORD_RESET,
            related_record=f"User: {user.username}",
            details=f"Password reset performed for {user.full_name}"
        )

        return Response(
            {'message': 'Password reset successfully.'},
            status=status.HTTP_200_OK
        )


class UserMonitoringListView(APIView):
    """
    Real-time User Monitoring:
    Returns ACTIVE, IDLE, INACTIVE metrics and detailed user status list.
    Accessible exclusively to Master Admin.
    """
    permission_classes = [permissions.IsAuthenticated, IsMasterAdmin]

    def get(self, request):
        users = User.objects.all().order_by('-last_active')
        serializer = UserMonitoringSerializer(users, many=True)
        data = serializer.data

        counts = {
            'ACTIVE': 0,
            'IDLE': 0,
            'INACTIVE': 0,
            'TOTAL': len(data),
        }

        for item in data:
            st = item.get('computed_status', 'INACTIVE')
            counts[st] = counts.get(st, 0) + 1

        return Response({
            'counts': counts,
            'users': data,
            'server_time': timezone.now().isoformat()
        })


class LoginHistoryListView(APIView):
    """
    Login History viewable exclusively by Master Admin.
    """
    permission_classes = [permissions.IsAuthenticated, IsMasterAdmin]

    def get(self, request):
        qs = LoginHistory.objects.all().order_by('-login_time')

        search = request.query_params.get('search')
        status_param = request.query_params.get('status')

        if search:
            qs = qs.filter(
                Q(username_attempted__icontains=search) |
                Q(ip_address__icontains=search) |
                Q(browser__icontains=search)
            )
        if status_param:
            qs = qs.filter(status=status_param)

        # Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 25
        page = paginator.paginate_queryset(qs, request)
        serializer = LoginHistorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
