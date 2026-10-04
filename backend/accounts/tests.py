from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, LoginHistory
from activity_logs.models import ActivityLog


class AccountAndAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Master Admin
        self.master_admin = User.objects.create_superuser(
            username='masteradmin',
            full_name='Chief Master Administrator',
            password='SecureMasterPassword123!',
            role=User.ROLE_MASTER_ADMIN
        )

        # Create Regular Admin
        self.admin_user = User.objects.create_user(
            username='branchadmin',
            full_name='Branch Administrator',
            password='BranchPassword123!',
            role=User.ROLE_ADMIN
        )

        # Create Staff User
        self.staff_user = User.objects.create_user(
            username='funeralstaff',
            full_name='Operations Staff',
            password='StaffPassword123!',
            role=User.ROLE_STAFF
        )

        # Create Inactive User
        self.inactive_user = User.objects.create_user(
            username='inactivestaff',
            full_name='Former Employee',
            password='FormerPassword123!',
            role=User.ROLE_STAFF,
            status=User.STATUS_INACTIVE
        )

    def test_login_successful(self):
        response = self.client.post(reverse('auth_login'), {
            'username': 'masteradmin',
            'password': 'SecureMasterPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], User.ROLE_MASTER_ADMIN)

        # Check LoginHistory recorded
        self.assertTrue(LoginHistory.objects.filter(username_attempted='masteradmin', status='SUCCESS').exists())
        # Check ActivityLog recorded
        self.assertTrue(ActivityLog.objects.filter(action=ActivityLog.ACTION_LOGIN).exists())

    def test_login_wrong_password(self):
        response = self.client.post(reverse('auth_login'), {
            'username': 'masteradmin',
            'password': 'IncorrectPassword999!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertTrue(LoginHistory.objects.filter(username_attempted='masteradmin', status='FAILED').exists())

    def test_login_inactive_account(self):
        response = self.client.post(reverse('auth_login'), {
            'username': 'inactivestaff',
            'password': 'FormerPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('deactivated', response.data['detail'])

    def test_master_admin_can_create_admin_and_staff(self):
        self.client.force_authenticate(user=self.master_admin)
        response = self.client.post('/api/users/', {
            'full_name': 'New Assistant Admin',
            'username': 'newadmin',
            'password': 'Password1234!',
            'confirm_password': 'Password1234!',
            'role': User.ROLE_ADMIN,
            'status': User.STATUS_ACTIVE
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], User.ROLE_ADMIN)

    def test_admin_cannot_manage_users(self):
        self.client.force_authenticate(user=self.admin_user)
        # Attempt to list users
        res_list = self.client.get('/api/users/')
        self.assertEqual(res_list.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to create user
        res_create = self.client.post('/api/users/', {
            'full_name': 'Unauthorized User Attempt',
            'username': 'unauth_user',
            'password': 'Password1234!',
            'confirm_password': 'Password1234!',
            'role': User.ROLE_STAFF,
            'status': User.STATUS_ACTIVE
        })
        self.assertEqual(res_create.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_cannot_create_or_view_users(self):
        self.client.force_authenticate(user=self.staff_user)
        res_list = self.client.get('/api/users/')
        self.assertEqual(res_list.status_code, status.HTTP_403_FORBIDDEN)

        res_create = self.client.post('/api/users/', {
            'full_name': 'Staff Attempt',
            'username': 'staff_attempt',
            'password': 'Password1234!',
            'confirm_password': 'Password1234!',
            'role': User.ROLE_STAFF,
            'status': User.STATUS_ACTIVE
        })
        self.assertEqual(res_create.status_code, status.HTTP_403_FORBIDDEN)

    def test_master_admin_cannot_be_deleted(self):
        self.client.force_authenticate(user=self.master_admin)
        res = self.client.delete(f'/api/users/{self.master_admin.id}/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot be deleted', res.data['detail'])

    def test_admin_cannot_delete_master_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.delete(f'/api/users/{self.master_admin.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_master_admin_cannot_be_deactivated(self):
        self.client.force_authenticate(user=self.master_admin)
        res = self.client.post(f'/api/users/{self.master_admin.id}/deactivate/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot be deactivated', res.data['detail'])

    def test_user_activation_and_deactivation(self):
        self.client.force_authenticate(user=self.master_admin)

        # Deactivate staff
        res_deact = self.client.post(f'/api/users/{self.staff_user.id}/deactivate/')
        self.assertEqual(res_deact.status_code, status.HTTP_200_OK)
        self.staff_user.refresh_from_db()
        self.assertEqual(self.staff_user.status, User.STATUS_INACTIVE)
        self.assertFalse(self.staff_user.is_active)

        # Activate staff
        res_act = self.client.post(f'/api/users/{self.staff_user.id}/activate/')
        self.assertEqual(res_act.status_code, status.HTTP_200_OK)
        self.staff_user.refresh_from_db()
        self.assertEqual(self.staff_user.status, User.STATUS_ACTIVE)
        self.assertTrue(self.staff_user.is_active)
