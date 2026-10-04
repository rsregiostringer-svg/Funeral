import getpass
import os
from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Securely initializes or sets up the initial MASTER ADMIN user for Alaala Funeral Homes'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Master Admin username')
        parser.add_argument('--full-name', type=str, help='Full Name of Master Admin')
        parser.add_argument('--password', type=str, help='Password (optional, prompt used if omitted)')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== ALAALA FUNERAL HOMES - MASTER ADMIN SETUP ==="))

        # Check existing Master Admin
        existing_master = User.objects.filter(role=User.ROLE_MASTER_ADMIN).first()
        if existing_master:
            self.stdout.write(self.style.WARNING(
                f"Master Admin already exists: {existing_master.username} ({existing_master.full_name})."
            ))
            # Confirm if user wants to create an additional or update
            prompt_continue = input("Do you wish to create another Master Admin or reset? (y/N): ").strip().lower()
            if prompt_continue != 'y':
                self.stdout.write(self.style.SUCCESS("Exiting without modification."))
                return

        username = options.get('username') or os.getenv('MASTER_ADMIN_USERNAME')
        while not username:
            username = input("Enter Master Admin Username: ").strip()
            if not username:
                self.stdout.write(self.style.ERROR("Username cannot be blank."))

        # Check if username exists
        if User.objects.filter(username__iexact=username).exists():
            self.stdout.write(self.style.ERROR(f"A user with username '{username}' already exists."))
            return

        full_name = options.get('full_name') or os.getenv('MASTER_ADMIN_FULL_NAME')
        while not full_name:
            full_name = input("Enter Master Admin Full Name (e.g., Chief Administrator): ").strip()
            if not full_name:
                self.stdout.write(self.style.ERROR("Full Name cannot be blank."))

        password = options.get('password') or os.getenv('MASTER_ADMIN_PASSWORD')
        if not password:
            while True:
                password = getpass.getpass("Enter secure Master Admin password (min 8 characters): ")
                if len(password) < 8:
                    self.stdout.write(self.style.ERROR("Password must be at least 8 characters long."))
                    continue
                confirm_password = getpass.getpass("Confirm password: ")
                if password != confirm_password:
                    self.stdout.write(self.style.ERROR("Passwords do not match. Please try again."))
                    continue
                break

        user = User.objects.create_superuser(
            username=username,
            full_name=full_name,
            password=password,
            role=User.ROLE_MASTER_ADMIN,
            status=User.STATUS_ACTIVE
        )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully created Master Admin: {user.username} ({user.full_name})"
        ))
        self.stdout.write(self.style.SUCCESS(
            "Account is active, protected, and has full system authority."
        ))
