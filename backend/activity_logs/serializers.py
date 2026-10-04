from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'username',
            'role',
            'action',
            'action_display',
            'related_record',
            'details',
            'ip_address',
            'created_at',
        ]
        read_only_fields = fields
