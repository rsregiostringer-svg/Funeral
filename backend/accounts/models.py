from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.core.exceptions import ValidationError


class CustomUserManager(BaseUserManager):
    def create_user(self, username, full_name, password=None, role='STAFF', status='ACTIVE', **extra_fields):
        if not username:
            raise ValueError('The Username field is required')
        if not full_name:
            raise ValueError('The Full Name field is required')

        username = username.strip()
        user = self.model(
            username=username,
            full_name=full_name.strip(),
            role=role,
            status=status,
            is_active=(status == 'ACTIVE'),
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        if role == User.ROLE_MASTER_ADMIN:
            user.is_staff = True
            user.is_superuser = True
        elif role == User.ROLE_ADMIN:
            user.is_staff = True

        user.save(using=self._db)
        return user

    def create_superuser(self, username, full_name='System Master Admin', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.ROLE_MASTER_ADMIN)
        extra_fields.setdefault('status', User.STATUS_ACTIVE)

        if not password:
            raise ValueError('Superusers must have a password.')

        return self.create_user(
            username=username,
            full_name=full_name,
            password=password,
            **extra_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_MASTER_ADMIN = 'MASTER_ADMIN'
    ROLE_ADMIN = 'ADMIN'
    ROLE_STAFF = 'STAFF'

    ROLE_CHOICES = [
        (ROLE_MASTER_ADMIN, 'Master Admin'),
        (ROLE_ADMIN, 'Admin'),
        (ROLE_STAFF, 'Staff'),
    ]

    STATUS_ACTIVE = 'ACTIVE'
    STATUS_INACTIVE = 'INACTIVE'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
    ]

    full_name = models.CharField(max_length=150, help_text="Full legal or formal name")
    username = models.CharField(max_length=150, unique=True, db_index=True)
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default=ROLE_STAFF, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    last_active = models.DateTimeField(null=True, blank=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.username}) - {self.get_role_display()}"

    @property
    def is_master_admin(self):
        return self.role == self.ROLE_MASTER_ADMIN or self.is_superuser

    @property
    def is_admin_user(self):
        return self.role in [self.ROLE_MASTER_ADMIN, self.ROLE_ADMIN] or self.is_superuser

    @property
    def is_staff_user(self):
        return self.role == self.ROLE_STAFF

    def save(self, *args, **kwargs):
        # Synchronize Django's built-in is_active with status
        self.is_active = (self.status == self.STATUS_ACTIVE)
        if self.role == self.ROLE_MASTER_ADMIN:
            self.is_staff = True
            self.is_superuser = True
        super().save(*args, **kwargs)


class LoginHistory(models.Model):
    STATUS_SUCCESS = 'SUCCESS'
    STATUS_FAILED = 'FAILED'
    STATUS_LOGGED_OUT = 'LOGGED_OUT'
    STATUS_SESSION_EXPIRED = 'SESSION_EXPIRED'

    STATUS_CHOICES = [
        (STATUS_SUCCESS, 'Success'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_LOGGED_OUT, 'Logged Out'),
        (STATUS_SESSION_EXPIRED, 'Session Expired'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='login_histories')
    username_attempted = models.CharField(max_length=150)
    role = models.CharField(max_length=50, blank=True)
    login_time = models.DateTimeField(auto_now_add=True, db_index=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_SUCCESS)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    browser = models.CharField(max_length=100, blank=True)
    device = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Login History'
        verbose_name_plural = 'Login Histories'
        ordering = ['-login_time']

    def __str__(self):
        return f"{self.username_attempted} - {self.status} at {self.login_time}"


class SystemSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"{self.key}: {self.value}"
