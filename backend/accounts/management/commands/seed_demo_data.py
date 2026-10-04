from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from accounts.models import User
from funeral_cases.models import FuneralCase
from activity_logs.models import ActivityLog, record_activity


class Command(BaseCommand):
    help = 'Seeds realistic sample data for Alaala Funeral Homes (demo/testing purposes)'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Force create sample cases')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== SEEDING ALAALA FUNERAL HOMES DEMO DATA ==="))

        # Get or create admin user for attribution
        admin = User.objects.filter(role=User.ROLE_MASTER_ADMIN).first()
        if not admin:
            admin = User.objects.filter(role=User.ROLE_ADMIN).first()
        if not admin:
            self.stdout.write(self.style.WARNING(
                "No Master Admin or Admin exists yet. Run 'python manage.py setup_master_admin' first!"
            ))
            return

        cases_data = [
            {
                'case_number': 'AFH-2026-0001',
                'deceased_name': 'Hon. Roberto M. Silang',
                'gender': 'Male',
                'date_of_birth': date(1948, 5, 12),
                'date_of_passing': date.today() - timedelta(days=2),
                'age': 78,
                'informant_name': 'Carmela Silang-Reyes',
                'informant_contact': '+63 917 555 0192',
                'informant_relationship': 'Daughter',
                'informant_address': '124 Sampaguita St., Quezon City',
                'service_type': 'Traditional Burial',
                'chapel_room': 'Serenity Memorial Hall A',
                'casket_or_urn': 'Grand Mahogany Casket with Velvet Lining',
                'cemetery_or_columbarium': 'Loyola Memorial Park, Marikina',
                'interment_date': timezone.now() + timedelta(days=3),
                'case_status': 'IN_VIEWING',
                'total_amount': 185000.00,
                'notes': 'Family requested bilingual eulogy service and evening choir coordination.',
            },
            {
                'case_number': 'AFH-2026-0002',
                'deceased_name': 'Doña Teresa V. Alcantara',
                'gender': 'Female',
                'date_of_birth': date(1939, 11, 20),
                'date_of_passing': date.today() - timedelta(days=1),
                'age': 86,
                'informant_name': 'Dr. Joaquin V. Alcantara',
                'informant_contact': '+63 920 888 1234',
                'informant_relationship': 'Son',
                'informant_address': '88 Acacia Avenue, Ayala Alabang, Muntinlupa',
                'service_type': 'Cremation with Viewing',
                'chapel_room': 'St. Peter Presidential Suite',
                'casket_or_urn': 'Imperial Bronze Keepsake Urn',
                'cemetery_or_columbarium': 'Santuario de San Antonio Columbarium, Forbes Park',
                'interment_date': timezone.now() + timedelta(days=4),
                'case_status': 'IN_VIEWING',
                'total_amount': 240000.00,
                'notes': 'Viewing scheduled from 10:00 AM to 9:00 PM daily. Flowers arranged by family florist.',
            },
            {
                'case_number': 'AFH-2026-0003',
                'deceased_name': 'Capt. Fernando G. Ramos',
                'gender': 'Male',
                'date_of_birth': date(1962, 3, 15),
                'date_of_passing': date.today(),
                'age': 64,
                'informant_name': 'Elena Ramos',
                'informant_contact': '+63 908 333 4455',
                'informant_relationship': 'Spouse',
                'informant_address': 'Bgy. San Antonio, Pasig City',
                'service_type': 'Direct Cremation',
                'chapel_room': 'Preparation Suite 2',
                'casket_or_urn': 'Eco Bamboo Urn with Engraved Memorial Plaque',
                'cemetery_or_columbarium': 'Heritage Park Columbary, Taguig',
                'interment_date': timezone.now() + timedelta(days=2),
                'case_status': 'PENDING_EMBALMING',
                'total_amount': 85000.00,
                'notes': 'Naval honors requested for departure ceremony.',
            },
            {
                'case_number': 'AFH-2026-0004',
                'deceased_name': 'Maria Lourdes C. Santos',
                'gender': 'Female',
                'date_of_birth': date(1975, 8, 9),
                'date_of_passing': date.today() - timedelta(days=5),
                'age': 51,
                'informant_name': 'Antonio Santos',
                'informant_contact': '+63 919 777 2211',
                'informant_relationship': 'Brother',
                'informant_address': '45 Magnolia Drive, San Juan City',
                'service_type': 'Traditional Burial',
                'chapel_room': 'Grace Chapel B',
                'casket_or_urn': 'Pearl White Classic Wood Casket',
                'cemetery_or_columbarium': 'Manila Memorial Park, Sucat',
                'interment_date': timezone.now() - timedelta(days=1),
                'case_status': 'COMPLETED',
                'total_amount': 145000.00,
                'notes': 'Interment completed peacefully yesterday.',
            },
            {
                'case_number': 'AFH-2026-0005',
                'deceased_name': 'Jaime Gabriel Mercado',
                'gender': 'Male',
                'date_of_birth': date(1995, 12, 4),
                'date_of_passing': date.today() - timedelta(days=3),
                'age': 30,
                'informant_name': 'Gabriel Mercado Sr.',
                'informant_contact': '+63 922 111 9988',
                'informant_relationship': 'Father',
                'informant_address': '19 Rosal St., Mandaluyong City',
                'service_type': 'Memorial Service',
                'chapel_room': 'Hope Chapel',
                'casket_or_urn': 'Polished Marble Keepsake Urn',
                'cemetery_or_columbarium': 'San Felipe Neri Columbarium',
                'interment_date': timezone.now() + timedelta(days=1),
                'case_status': 'SCHEDULED_FOR_BURIAL',
                'total_amount': 110000.00,
                'notes': 'Memorial video tribute set up for viewing guests.',
            }
        ]

        count = 0
        for item in cases_data:
            case_num = item['case_number']
            if not FuneralCase.objects.filter(case_number=case_num).exists():
                case = FuneralCase.objects.create(
                    created_by=admin,
                    updated_by=admin,
                    **item
                )
                count += 1
                record_activity(
                    action=ActivityLog.ACTION_CASE_CREATED,
                    related_record=f"Case: {case.case_number}",
                    details=f"Demo seed: Created case for {case.deceased_name}",
                    user=admin
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} sample funeral cases!"))
