from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import date
from accounts.models import User
from funeral_cases.models import FuneralCase
from activity_logs.models import ActivityLog


class FuneralCaseTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.master_admin = User.objects.create_superuser(
            username='master_director',
            full_name='Master Director',
            password='Password123!',
            role=User.ROLE_MASTER_ADMIN
        )

        self.admin = User.objects.create_user(
            username='chapel_admin',
            full_name='Chapel Admin',
            password='Password123!',
            role=User.ROLE_ADMIN
        )

        self.staff = User.objects.create_user(
            username='chapel_staff',
            full_name='Chapel Staff',
            password='Password123!',
            role=User.ROLE_STAFF
        )

        # Existing case
        self.case1 = FuneralCase.objects.create(
            case_number='AFH-2026-0001',
            deceased_name='Juan Dela Cruz',
            gender='Male',
            date_of_passing=date(2026, 10, 1),
            age=72,
            informant_name='Maria Dela Cruz',
            informant_contact='+639171234567',
            informant_relationship='Spouse',
            service_type='Traditional Burial',
            chapel_room='Serenity Hall A',
            case_status=FuneralCase.STATUS_IN_VIEWING,
            created_by=self.master_admin
        )

    def test_unauthorized_api_requests(self):
        # Unauthenticated request
        response = self.client.get('/api/cases/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_case_creation_by_staff(self):
        self.client.force_authenticate(user=self.staff)
        payload = {
            'case_number': 'AFH-2026-0002',
            'deceased_name': 'Clara Santos',
            'gender': 'Female',
            'date_of_passing': '2026-10-02',
            'age': 65,
            'informant_name': 'Roberto Santos',
            'informant_contact': '+639189876543',
            'informant_relationship': 'Son',
            'service_type': 'Direct Cremation',
            'chapel_room': 'Chapel of Grace',
            'case_status': 'PENDING_EMBALMING',
            'total_amount': 75000.00,
        }
        response = self.client.post('/api/cases/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['case_number'], 'AFH-2026-0002')
        self.assertEqual(response.data['deceased_name'], 'Clara Santos')

        # Check ActivityLog
        self.assertTrue(ActivityLog.objects.filter(
            action=ActivityLog.ACTION_CASE_CREATED,
            related_record='Case: AFH-2026-0002'
        ).exists())

    def test_duplicate_case_number_rejected(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'case_number': 'AFH-2026-0001',  # Already exists!
            'deceased_name': 'Pedro Penduko',
            'gender': 'Male',
            'date_of_passing': '2026-10-02',
            'informant_name': 'Juana',
            'informant_contact': '09123456789',
            'informant_relationship': 'Sister',
            'service_type': 'Traditional Burial',
        }
        response = self.client.post('/api/cases/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('case_number', response.data)
        self.assertIn('Case Number already exists.', str(response.data['case_number']))

    def test_case_search_endpoint(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.get('/api/cases/search/?q=AFH-2026-0001')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['deceased_name'], 'Juan Dela Cruz')

    def test_admin_can_create_and_view_deceased_and_family(self):
        self.client.force_authenticate(user=self.admin)
        
        # 1. Admin can view existing case
        res_view = self.client.get(f'/api/cases/{self.case1.id}/')
        self.assertEqual(res_view.status_code, status.HTTP_200_OK)
        self.assertEqual(res_view.data['deceased_name'], 'Juan Dela Cruz')
        self.assertEqual(res_view.data['informant_name'], 'Maria Dela Cruz')

        # 2. Admin can create new case (deceased and family info)
        payload = {
            'case_number': 'AFH-2026-0099',
            'deceased_name': 'Benigno Aquino',
            'gender': 'Male',
            'date_of_passing': '2026-10-02',
            'informant_name': 'Aurora Aquino',
            'informant_contact': '+639198887766',
            'informant_relationship': 'Spouse',
            'service_type': 'Traditional Burial',
        }
        res_create = self.client.post('/api/cases/', payload)
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_create.data['case_number'], 'AFH-2026-0099')

    def test_admin_can_edit_case(self):
        self.client.force_authenticate(user=self.admin)
        res_update = self.client.patch(f'/api/cases/{self.case1.id}/', {
            'chapel_room': 'Presidential Suite B',
        })
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.case1.refresh_from_db()
        self.assertEqual(self.case1.chapel_room, 'Presidential Suite B')

    def test_staff_cannot_edit_case(self):
        self.client.force_authenticate(user=self.staff)
        res_update = self.client.patch(f'/api/cases/{self.case1.id}/', {
            'chapel_room': 'Illegally Modified by Staff',
        })
        self.assertEqual(res_update.status_code, status.HTTP_403_FORBIDDEN)
        self.case1.refresh_from_db()
        self.assertNotEqual(self.case1.chapel_room, 'Illegally Modified by Staff')

    def test_admin_cannot_delete_case(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'/api/cases/{self.case1.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.case1.refresh_from_db()
        self.assertFalse(self.case1.is_deleted)

    def test_master_admin_can_edit_and_delete_case(self):
        self.client.force_authenticate(user=self.master_admin)

        # Master admin can edit
        res_update = self.client.patch(f'/api/cases/{self.case1.id}/', {
            'chapel_room': 'Presidential Hall 1',
        })
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.case1.refresh_from_db()
        self.assertEqual(self.case1.chapel_room, 'Presidential Hall 1')

        # Master admin can soft delete
        response = self.client.delete(f'/api/cases/{self.case1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.case1.refresh_from_db()
        self.assertTrue(self.case1.is_deleted)
        self.assertEqual(self.case1.deleted_by, self.master_admin)
        self.assertIsNotNone(self.case1.deleted_at)

        # Check deletion was logged
        self.assertTrue(ActivityLog.objects.filter(
            action=ActivityLog.ACTION_CASE_DELETED,
            related_record=f"Case: {self.case1.case_number}"
        ).exists())

    def test_random_case_number_generation_and_bir_receipt(self):
        self.client.force_authenticate(user=self.staff)
        # Create case without case_number; provide bir_receipt_number
        payload = {
            'deceased_name': 'Carlos Yulo',
            'gender': 'Male',
            'date_of_passing': '2026-10-02',
            'informant_name': 'Mark Yulo',
            'informant_contact': '+639191112233',
            'informant_relationship': 'Brother',
            'service_type': 'Memorial Service',
            'bir_receipt_number': 'BIR-2026-OR-987654',
        }
        response = self.client.post('/api/cases/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['case_number'].startswith('AFH-'))
        self.assertEqual(response.data['bir_receipt_number'], 'BIR-2026-OR-987654')

        # Verify search by BIR receipt number works
        search_res = self.client.get('/api/cases/?search=987654')
        self.assertEqual(search_res.status_code, status.HTTP_200_OK)
        results = search_res.data.get('results', search_res.data)
        self.assertTrue(any(c['bir_receipt_number'] == 'BIR-2026-OR-987654' for c in results))

    def test_name_capitalization_and_last_first_middle_formatting(self):
        self.client.force_authenticate(user=self.staff)
        payload = {
            'deceased_last_name': 'dela cruz',
            'deceased_first_name': 'juan carlos',
            'deceased_middle_name': 'santos',
            'gender': 'Male',
            'date_of_passing': '2026-10-02',
            'informant_last_name': 'dela cruz',
            'informant_first_name': 'maria clara',
            'informant_middle_name': 'ramos',
            'informant_contact': '+639171112233',
            'informant_relationship': 'Daughter',
            'service_type': 'Traditional Burial',
        }
        response = self.client.post('/api/cases/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['deceased_last_name'], 'Dela Cruz')
        self.assertEqual(response.data['deceased_first_name'], 'Juan Carlos')
        self.assertEqual(response.data['deceased_middle_name'], 'Santos')
        self.assertEqual(response.data['deceased_name'], 'Dela Cruz, Juan Carlos Santos')

        self.assertEqual(response.data['informant_last_name'], 'Dela Cruz')
        self.assertEqual(response.data['informant_first_name'], 'Maria Clara')
        self.assertEqual(response.data['informant_middle_name'], 'Ramos')
        self.assertEqual(response.data['informant_name'], 'Dela Cruz, Maria Clara Ramos')

    def test_admin_can_access_reports_and_export(self):
        self.client.force_authenticate(user=self.admin)
        
        # Admin can view reports
        res_overview = self.client.get('/api/reports/')
        self.assertEqual(res_overview.status_code, status.HTTP_200_OK)
        self.assertIn('total_cases', res_overview.data)

        # Admin can download/export CSV
        res_export = self.client.get('/api/reports/?format=csv')
        self.assertEqual(res_export.status_code, status.HTTP_200_OK)
        self.assertEqual(res_export['Content-Type'], 'text/csv')
        self.assertIn('Alaala_Funeral_Cases_Report', res_export['Content-Disposition'])



