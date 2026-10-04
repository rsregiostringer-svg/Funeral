from rest_framework import permissions
from .models import User


class IsMasterAdmin(permissions.BasePermission):
    """Allows access only to Master Admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.is_master_admin
        )


class IsAdminOrMasterAdmin(permissions.BasePermission):
    """Allows access to Admin and Master Admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.is_admin_user
        )


class CanManageUser(permissions.BasePermission):
    """
    Object-level and model-level permission:
    - Master Admin has exclusive authority to manage users (create, edit, deactivate, delete).
    - Regular Admin and Staff CANNOT manage any users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.is_master_admin
        )

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.is_master_admin
        )


class CanDeleteRecord(permissions.BasePermission):
    """
    Ensures ONLY Master Admin can delete records (such as Funeral Cases).
    Admins and Staff users are strictly forbidden from deletion.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'DELETE':
            return bool(
                request.user and
                request.user.is_authenticated and
                request.user.is_active and
                request.user.is_master_admin
            )
        return True


class CanEditRecord(permissions.BasePermission):
    """
    Ensures Master Admin and Admin can edit / update records.
    Staff accounts are limited to add/create and view.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS or request.method == 'POST':
            return True
        if request.method in ['PUT', 'PATCH']:
            return bool(
                request.user and
                request.user.is_authenticated and
                request.user.is_active and
                request.user.is_admin_user
            )
        return True

