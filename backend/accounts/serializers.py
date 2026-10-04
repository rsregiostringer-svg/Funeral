from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import User, LoginHistory, SystemSetting
from activity_logs.models import record_activity


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'username',
            'email',
            'role',
            'status',
            'last_login',
            'last_active',
            'created_at',
            'updated_at',
            'is_active',
        ]
        read_only_fields = ['id', 'last_login', 'last_active', 'created_at', 'updated_at', 'is_active']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'username',
            'password',
            'confirm_password',
            'role',
            'status',
        ]

    def validate_username(self, value):
        val = value.strip()
        if User.objects.filter(username__iexact=val).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return val

    def validate(self, attrs):
        request = self.context.get('request')
        current_user = request.user if request else None

        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})

        target_role = attrs.get('role', User.ROLE_STAFF)

        # Role assignment protection:
        # Only Master Admin can create Master Admin or Admin
        if target_role in [User.ROLE_MASTER_ADMIN, User.ROLE_ADMIN]:
            if not (current_user and current_user.is_master_admin):
                raise serializers.ValidationError({
                    'role': "Only a Master Admin can create Admin or Master Admin accounts."
                })

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'email', 'role', 'status']

    def validate(self, attrs):
        request = self.context.get('request')
        current_user = request.user if request else None
        instance = self.instance

        # Protection: If target instance is Master Admin
        if instance.is_master_admin:
            if not (current_user and current_user.is_master_admin):
                raise serializers.ValidationError(
                    "You do not have permission to modify a Master Admin account."
                )
            # Cannot deactivate Master Admin
            if attrs.get('status') == User.STATUS_INACTIVE:
                raise serializers.ValidationError({
                    'status': "Master Admin accounts cannot be deactivated."
                })
            # Cannot demote Master Admin role
            if attrs.get('role') and attrs.get('role') != User.ROLE_MASTER_ADMIN:
                raise serializers.ValidationError({
                    'role': "Master Admin role cannot be demoted."
                })

        # Regular Admin cannot promote anyone to Admin or Master Admin
        target_role = attrs.get('role')
        if target_role in [User.ROLE_MASTER_ADMIN, User.ROLE_ADMIN]:
            if not (current_user and current_user.is_master_admin):
                raise serializers.ValidationError({
                    'role': "Only Master Admin can assign Admin or Master Admin roles."
                })

        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        return attrs


class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = [
            'id',
            'user',
            'username_attempted',
            'role',
            'login_time',
            'logout_time',
            'last_active',
            'status',
            'ip_address',
            'user_agent',
            'browser',
            'device',
        ]
        read_only_fields = fields


class UserMonitoringSerializer(serializers.ModelSerializer):
    computed_status = serializers.SerializerMethodField()
    latest_login_time = serializers.SerializerMethodField()
    latest_logout_time = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'username',
            'role',
            'status',
            'computed_status',
            'latest_login_time',
            'last_active',
            'latest_logout_time',
        ]

    def get_computed_status(self, obj):
        if obj.status == User.STATUS_INACTIVE or not obj.is_active:
            return 'INACTIVE'

        if not obj.last_active:
            return 'INACTIVE'

        now = timezone.now()
        idle_threshold = now - timedelta(minutes=3)
        inactive_threshold = now - timedelta(minutes=15)

        # Check most recent login history for explicit logout
        latest_history = obj.login_histories.first()
        if latest_history and latest_history.logout_time:
            if latest_history.logout_time >= obj.last_active:
                return 'INACTIVE'

        if obj.last_active >= idle_threshold:
            return 'ACTIVE'
        elif obj.last_active >= inactive_threshold:
            return 'IDLE'
        else:
            return 'INACTIVE'

    def get_latest_login_time(self, obj):
        latest = obj.login_histories.filter(status='SUCCESS').first()
        return latest.login_time if latest else obj.last_login

    def get_latest_logout_time(self, obj):
        latest = obj.login_histories.first()
        return latest.logout_time if latest else None
