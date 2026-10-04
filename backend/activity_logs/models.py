from django.db import models
from django.conf import settings
from django.utils import timezone


class ActivityLog(models.Model):
    ACTION_LOGIN = 'LOGIN'
    ACTION_LOGOUT = 'LOGOUT'
    ACTION_USER_CREATED = 'USER_CREATED'
    ACTION_USER_EDITED = 'USER_EDITED'
    ACTION_USER_ACTIVATED = 'USER_ACTIVATED'
    ACTION_USER_DEACTIVATED = 'USER_DEACTIVATED'
    ACTION_PASSWORD_RESET = 'PASSWORD_RESET'
    ACTION_USER_DELETED = 'USER_DELETED'
    ACTION_CASE_CREATED = 'CASE_CREATED'
    ACTION_CASE_VIEWED = 'CASE_VIEWED'
    ACTION_CASE_UPDATED = 'CASE_UPDATED'
    ACTION_CASE_DELETED = 'CASE_DELETED'
    ACTION_CASE_SEARCHED = 'CASE_SEARCHED'
    ACTION_REPORT_DOWNLOADED = 'REPORT_DOWNLOADED'
    ACTION_SETTINGS_UPDATED = 'SETTINGS_UPDATED'

    ACTION_CHOICES = [
        (ACTION_LOGIN, 'Login'),
        (ACTION_LOGOUT, 'Logout'),
        (ACTION_USER_CREATED, 'User Created'),
        (ACTION_USER_EDITED, 'User Edited'),
        (ACTION_USER_ACTIVATED, 'User Activated'),
        (ACTION_USER_DEACTIVATED, 'User Deactivated'),
        (ACTION_PASSWORD_RESET, 'Password Reset'),
        (ACTION_USER_DELETED, 'User Deleted'),
        (ACTION_CASE_CREATED, 'Funeral Case Created'),
        (ACTION_CASE_VIEWED, 'Funeral Case Viewed'),
        (ACTION_CASE_UPDATED, 'Funeral Case Updated'),
        (ACTION_CASE_DELETED, 'Funeral Case Deleted'),
        (ACTION_CASE_SEARCHED, 'Case Searched'),
        (ACTION_REPORT_DOWNLOADED, 'Report Downloaded'),
        (ACTION_SETTINGS_UPDATED, 'Settings Updated'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )
    username = models.CharField(max_length=150)
    role = models.CharField(max_length=50)
    action = models.CharField(max_length=60, choices=ACTION_CHOICES, db_index=True)
    related_record = models.CharField(max_length=255, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.created_at.strftime('%Y-%m-%d %H:%M:%S')} | {self.username} ({self.role}) - {self.action}: {self.related_record}"

    # Immutable safeguard
    def delete(self, *args, **kwargs):
        raise ValueError("Activity logs cannot be deleted.")


def get_client_ip(request):
    """Utility to extract client IP address from request"""
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_client_agent_details(request):
    """Utility to parse user agent, browser, device"""
    if not request:
        return {'user_agent': '', 'browser': 'Unknown', 'device': 'Unknown'}
    
    ua = request.META.get('HTTP_USER_AGENT', '')
    browser = 'Other'
    device = 'Desktop'

    ua_lower = ua.lower()
    if 'mobile' in ua_lower or 'android' in ua_lower or 'iphone' in ua_lower:
        device = 'Mobile'
    elif 'tablet' in ua_lower or 'ipad' in ua_lower:
        device = 'Tablet'

    if 'edg' in ua_lower:
        browser = 'Edge'
    elif 'chrome' in ua_lower:
        browser = 'Chrome'
    elif 'safari' in ua_lower and 'chrome' not in ua_lower:
        browser = 'Safari'
    elif 'firefox' in ua_lower:
        browser = 'Firefox'
    elif 'opera' in ua_lower or 'opr' in ua_lower:
        browser = 'Opera'

    return {
        'user_agent': ua,
        'browser': browser,
        'device': device
    }


def record_activity(request=None, action=None, related_record='', details='', user=None):
    """Global helper to record immutable activity logs"""
    target_user = user
    if not target_user and request and hasattr(request, 'user') and request.user.is_authenticated:
        target_user = request.user

    username = target_user.username if target_user else 'System/Anonymous'
    role = target_user.role if target_user and hasattr(target_user, 'role') else 'SYSTEM'
    ip = get_client_ip(request) if request else None

    return ActivityLog.objects.create(
        user=target_user if (target_user and getattr(target_user, 'is_authenticated', False)) else None,
        username=username,
        role=role,
        action=action,
        related_record=related_record,
        details=details,
        ip_address=ip
    )
