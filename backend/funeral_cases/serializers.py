from rest_framework import serializers
from .models import FuneralCase
from accounts.serializers import UserSerializer


class FuneralCaseSerializer(serializers.ModelSerializer):
    created_by_detail = serializers.SerializerMethodField(read_only=True)
    updated_by_detail = serializers.SerializerMethodField(read_only=True)
    deleted_by_detail = serializers.SerializerMethodField(read_only=True)
    case_status_display = serializers.CharField(source='get_case_status_display', read_only=True)
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)

    class Meta:
        model = FuneralCase
        fields = [
            'id',
            'case_number',
            'bir_receipt_number',
            'deceased_last_name',
            'deceased_first_name',
            'deceased_middle_name',
            'deceased_name',
            'gender',
            'date_of_birth',
            'date_of_passing',
            'age',
            'informant_last_name',
            'informant_first_name',
            'informant_middle_name',
            'informant_name',
            'informant_contact',
            'informant_relationship',
            'informant_address',
            'service_type',
            'service_type_display',
            'chapel_room',
            'casket_or_urn',
            'cemetery_or_columbarium',
            'interment_date',
            'total_amount',
            'case_status',
            'case_status_display',
            'notes',
            'is_deleted',
            'deleted_at',
            'deleted_by',
            'deleted_by_detail',
            'created_by',
            'created_by_detail',
            'updated_by',
            'updated_by_detail',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'is_deleted',
            'deleted_at',
            'deleted_by',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'case_number': {
                'required': False,
                'allow_blank': True,
                'error_messages': {
                    'unique': 'Case Number already exists.',
                }
            },
            'bir_receipt_number': {
                'required': False,
                'allow_blank': True,
            },
            'deceased_name': {
                'required': False,
                'allow_blank': True,
            },
            'informant_name': {
                'required': False,
                'allow_blank': True,
            }
        }

    def get_created_by_detail(self, obj):
        if obj.created_by:
            return {'id': obj.created_by.id, 'name': obj.created_by.full_name, 'username': obj.created_by.username}
        return None

    def get_updated_by_detail(self, obj):
        if obj.updated_by:
            return {'id': obj.updated_by.id, 'name': obj.updated_by.full_name, 'username': obj.updated_by.username}
        return None

    def get_deleted_by_detail(self, obj):
        if obj.deleted_by:
            return {'id': obj.deleted_by.id, 'name': obj.deleted_by.full_name, 'username': obj.deleted_by.username}
        return None

    def validate_case_number(self, value):
        if not value or not value.strip():
            from .models import generate_random_case_number
            return generate_random_case_number()
        
        case_num = value.strip().upper()
        qs = FuneralCase.objects.filter(case_number__iexact=case_num)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Case Number already exists.")
        return case_num

    def validate(self, attrs):
        from .models import format_title_name

        # Deceased Name handling
        last = attrs.get('deceased_last_name', '').strip()
        first = attrs.get('deceased_first_name', '').strip()
        middle = attrs.get('deceased_middle_name', '').strip()

        if last or first:
            attrs['deceased_last_name'] = format_title_name(last)
            attrs['deceased_first_name'] = format_title_name(first)
            attrs['deceased_middle_name'] = format_title_name(middle)
            if middle:
                attrs['deceased_name'] = f"{attrs['deceased_last_name']}, {attrs['deceased_first_name']} {attrs['deceased_middle_name']}".strip()
            else:
                attrs['deceased_name'] = f"{attrs['deceased_last_name']}, {attrs['deceased_first_name']}".strip()
        elif 'deceased_name' in attrs and attrs['deceased_name']:
            attrs['deceased_name'] = format_title_name(attrs['deceased_name'])
        elif not self.instance:
            # For new cases, require deceased name
            if not attrs.get('deceased_name'):
                raise serializers.ValidationError({"deceased_last_name": "Deceased last name is required."})

        # Informant Name handling
        inf_last = attrs.get('informant_last_name', '').strip()
        inf_first = attrs.get('informant_first_name', '').strip()
        inf_middle = attrs.get('informant_middle_name', '').strip()

        if inf_last or inf_first:
            attrs['informant_last_name'] = format_title_name(inf_last)
            attrs['informant_first_name'] = format_title_name(inf_first)
            attrs['informant_middle_name'] = format_title_name(inf_middle)
            if inf_middle:
                attrs['informant_name'] = f"{attrs['informant_last_name']}, {attrs['informant_first_name']} {attrs['informant_middle_name']}".strip()
            else:
                attrs['informant_name'] = f"{attrs['informant_last_name']}, {attrs['informant_first_name']}".strip()
        elif 'informant_name' in attrs and attrs['informant_name']:
            attrs['informant_name'] = format_title_name(attrs['informant_name'])
        elif not self.instance:
            if not attrs.get('informant_name'):
                raise serializers.ValidationError({"informant_last_name": "Informant last name is required."})

        return super().validate(attrs)
