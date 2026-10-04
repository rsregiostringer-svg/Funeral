from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
import random
import string


import re


def format_title_name(val):
    """
    Capitalizes the first letter of each word/token (e.g. 'dela cruz' -> 'Dela Cruz', 'juan' -> 'Juan').
    """
    if not val:
        return ''
    return re.sub(r'(?:^|\s|-)[a-z]', lambda m: m.group(0).upper(), str(val).strip())


def generate_random_case_number():
    """Generates a random unique case number like AFH-2026-84920"""
    year = timezone.now().year
    while True:
        random_digits = ''.join(random.choices(string.digits, k=5))
        candidate = f"AFH-{year}-{random_digits}"
        if not FuneralCase.objects.filter(case_number=candidate).exists():
            return candidate


class FuneralCase(models.Model):
    # Case Statuses
    STATUS_PENDING_EMBALMING = 'PENDING_EMBALMING'
    STATUS_IN_VIEWING = 'IN_VIEWING'
    STATUS_SCHEDULED_BURIAL = 'SCHEDULED_FOR_BURIAL'
    STATUS_SCHEDULED_CREMATION = 'SCHEDULED_FOR_CREMATION'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_CANCELLED = 'CANCELLED'

    CASE_STATUS_CHOICES = [
        (STATUS_PENDING_EMBALMING, 'Pending Embalming'),
        (STATUS_IN_VIEWING, 'In Viewing / Chapel'),
        (STATUS_SCHEDULED_BURIAL, 'Scheduled for Burial'),
        (STATUS_SCHEDULED_CREMATION, 'Scheduled for Cremation'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    # Service Types
    SERVICE_TRADITIONAL_BURIAL = 'Traditional Burial'
    SERVICE_DIRECT_CREMATION = 'Direct Cremation'
    SERVICE_CREMATION_VIEWING = 'Cremation with Viewing'
    SERVICE_MEMORIAL_SERVICE = 'Memorial Service'
    SERVICE_REPATRIATION = 'Repatriation'
    SERVICE_OTHER = 'Other'

    SERVICE_TYPE_CHOICES = [
        (SERVICE_TRADITIONAL_BURIAL, 'Traditional Burial'),
        (SERVICE_DIRECT_CREMATION, 'Direct Cremation'),
        (SERVICE_CREMATION_VIEWING, 'Cremation with Viewing'),
        (SERVICE_MEMORIAL_SERVICE, 'Memorial Service'),
        (SERVICE_REPATRIATION, 'Repatriation'),
        (SERVICE_OTHER, 'Other'),
    ]

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    # 1. Identification (Randomly generated unique case number)
    case_number = models.CharField(
        max_length=60,
        unique=True,
        db_index=True,
        default=generate_random_case_number,
        error_messages={
            'unique': 'Case Number already exists.',
            'blank': 'Case Number is required.'
        },
        help_text="Randomly generated official case number (e.g. AFH-2026-84920)"
    )

    # Official BIR Code Receipt / OR Number (entered by user from official BIR document)
    bir_receipt_number = models.CharField(
        max_length=100,
        blank=True,
        default='',
        db_index=True,
        help_text="Official BIR Code Receipt / OR Number (from Bureau of Internal Revenue)"
    )

    # 2. Deceased Information (Structured as Last Name, First Name, Middle Name)
    deceased_last_name = models.CharField(max_length=100, blank=True, default='')
    deceased_first_name = models.CharField(max_length=100, blank=True, default='')
    deceased_middle_name = models.CharField(max_length=100, blank=True, default='')
    deceased_name = models.CharField(max_length=200, db_index=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='Male')
    date_of_birth = models.DateField(null=True, blank=True)
    date_of_passing = models.DateField(db_index=True)
    age = models.PositiveIntegerField(null=True, blank=True)

    # 3. Informant / Family Representative (Structured as Last Name, First Name, Middle Name)
    informant_last_name = models.CharField(max_length=100, blank=True, default='')
    informant_first_name = models.CharField(max_length=100, blank=True, default='')
    informant_middle_name = models.CharField(max_length=100, blank=True, default='')
    informant_name = models.CharField(max_length=200, help_text="Next of kin or contact person")
    informant_contact = models.CharField(max_length=50)
    informant_relationship = models.CharField(max_length=100)
    informant_address = models.TextField(blank=True)

    # 4. Service Specifications
    service_type = models.CharField(
        max_length=60,
        choices=SERVICE_TYPE_CHOICES,
        default=SERVICE_TRADITIONAL_BURIAL,
        db_index=True
    )
    chapel_room = models.CharField(max_length=150, blank=True, help_text="e.g. Serenity Chapel, St. Peter Suite")
    casket_or_urn = models.CharField(max_length=150, blank=True, help_text="Selected model or type")
    cemetery_or_columbarium = models.CharField(max_length=200, blank=True)
    interment_date = models.DateTimeField(null=True, blank=True)

    # 5. Financial & Case Status
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    case_status = models.CharField(
        max_length=50,
        choices=CASE_STATUS_CHOICES,
        default=STATUS_PENDING_EMBALMING,
        db_index=True
    )
    notes = models.TextField(blank=True)

    # 6. Audit & Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_cases'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_cases'
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 7. Soft Delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_cases'
    )

    class Meta:
        verbose_name = 'Funeral Case'
        verbose_name_plural = 'Funeral Cases'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.case_number} - {self.deceased_name} ({self.get_case_status_display()})"

    def clean(self):
        super().clean()
        if not self.case_number or not self.case_number.strip():
            self.case_number = generate_random_case_number()
        else:
            self.case_number = self.case_number.strip().upper()
            qs = FuneralCase.objects.filter(case_number__iexact=self.case_number)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            if qs.exists():
                raise ValidationError({"case_number": "Case Number already exists."})
        if self.bir_receipt_number:
            self.bir_receipt_number = self.bir_receipt_number.strip()

        # Format and assemble deceased name: Last Name, First Name Middle Name
        if self.deceased_last_name or self.deceased_first_name:
            self.deceased_last_name = format_title_name(self.deceased_last_name)
            self.deceased_first_name = format_title_name(self.deceased_first_name)
            self.deceased_middle_name = format_title_name(self.deceased_middle_name)
            if self.deceased_middle_name:
                self.deceased_name = f"{self.deceased_last_name}, {self.deceased_first_name} {self.deceased_middle_name}".strip()
            else:
                self.deceased_name = f"{self.deceased_last_name}, {self.deceased_first_name}".strip()
        elif self.deceased_name:
            self.deceased_name = format_title_name(self.deceased_name)

        # Format and assemble informant name: Last Name, First Name Middle Name
        if self.informant_last_name or self.informant_first_name:
            self.informant_last_name = format_title_name(self.informant_last_name)
            self.informant_first_name = format_title_name(self.informant_first_name)
            self.informant_middle_name = format_title_name(self.informant_middle_name)
            if self.informant_middle_name:
                self.informant_name = f"{self.informant_last_name}, {self.informant_first_name} {self.informant_middle_name}".strip()
            else:
                self.informant_name = f"{self.informant_last_name}, {self.informant_first_name}".strip()
        elif self.informant_name:
            self.informant_name = format_title_name(self.informant_name)

    def save(self, *args, **kwargs):
        if not self.case_number or not self.case_number.strip():
            self.case_number = generate_random_case_number()
        else:
            self.case_number = self.case_number.strip().upper()
        if self.bir_receipt_number:
            self.bir_receipt_number = self.bir_receipt_number.strip()
        self.full_clean()
        super().save(*args, **kwargs)

    def soft_delete(self, user):
        """Perform an administrative soft delete and stamp metadata"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
