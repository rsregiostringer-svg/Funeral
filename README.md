# ALAALA FUNERAL HOMES MANAGEMENT SYSTEM

> **"Honoring Legacies, Preserving Sacred Memories"**  
> A complete, enterprise-grade, production-ready web application for **Alaala Funeral Homes**. Built from the ground up with React, Tailwind CSS, Django REST Framework, and PostgreSQL/SQLite support.

---

## 🏛️ System Overview

The **Alaala Funeral Homes Management System** provides comprehensive funeral home management, family representative coordination, chapel scheduling, live administrative presence tracking, audit logging, and case record archiving.

### Key Architecture
```
React / Vite / Tailwind CSS
           ↓ (JWT Bearer Token / HTTPS)
Django REST Framework API
           ↓
Django ORM & Role-Based Permissions
           ↓
PostgreSQL (Production) / SQLite (Local Dev Fallback)
```

- **Strict Separation of Concerns**: React communicates solely through the authenticated Django REST API. React never directly connects to the database.
- **Enterprise Security**: Role-based access control (RBAC) enforced on the backend, password hashing with PBKDF2/SHA256, immutable activity logs, and tamper-proof Master Admin protections.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 / 18 + Vite
- **Styling**: Tailwind CSS (custom dignified obsidian/gold palette)
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React (**100% Lucide icons; strictly zero emojis in UI**)
- **Motion**: Framer Motion (subtle, accessible micro-interactions, modal transitions, and toasts)
- **HTTP Client**: Axios with automatic JWT token refresh interceptors

### Backend
- **Core**: Python 3.12+ / Django 5+
- **API Framework**: Django REST Framework (DRF)
- **Authentication**: `djangorestframework-simplejwt` (Access & Refresh tokens)
- **CORS Handling**: `django-cors-headers`
- **Static Assets**: WhiteNoise
- **Database Engine**: `dj-database-url` (PostgreSQL in production, SQLite fallback in local development)

---

## 🛡️ User Roles & Permissions

The system implements 3 distinct operational roles:

| Role | Permissions & Capabilities | Protections |
|---|---|---|
| **MASTER ADMIN** | Highest-level administrator. Full access to everything. Can create, edit, activate, deactivate, and delete Admin and Staff. Can view all activity logs, login history, and live user monitoring. Can manage cases and delete records. | **Protected Account**: Regular Admins and Staff cannot delete, deactivate, demote, or modify permissions of any Master Admin. |
| **ADMIN** | Can manage operations, view team activity logs and login history, create and manage Staff accounts. Can create, edit, search, and delete funeral records. | Cannot create or delete Master Admins or other Admins. Cannot access Master Admin system configurations. |
| **STAFF** | Frontline chapel operations. Can create, view, and edit funeral cases. Can perform case search and print dossiers. | **Cannot delete records** (Backend raises HTTP 403 Forbidden). Cannot access User Management, Activity Logs, Login History, or Reports unless explicitly elevated. |

---

## 📂 Project Structure

```
Alaala_System/
├── open_funeral_system.bat      # One-click Windows startup script
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Full-stack Docker deployment (PostgreSQL + Django)
├── .env.example                 # Environment configuration template
├── .gitignore                   # Version control exclusions
├── README.md                    # System documentation
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt         # Production Python packages
│   ├── config/                  # Django project settings, URLs, WSGI
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/                # User model, Auth, Surveillance, Login History
│   │   ├── models.py            # User, LoginHistory, SystemSetting
│   │   ├── permissions.py       # IsMasterAdmin, IsAdminOrMasterAdmin, CanDeleteRecord
│   │   ├── serializers.py
│   │   ├── views.py             # Login, Logout, Heartbeat, Monitoring, UserViewSet
│   │   ├── urls.py
│   │   ├── tests.py             # Accounts & security test suite
│   │   └── management/commands/
│   │       ├── setup_master_admin.py  # Secure Master Admin setup
│   │       └── seed_demo_data.py      # Realistic demo funeral case seed
│   ├── funeral_cases/           # Funeral Case Records
│   │   ├── models.py            # FuneralCase (Manual case number, soft delete)
│   │   ├── serializers.py
│   │   ├── views.py             # FuneralCaseViewSet (Staff delete restriction)
│   │   ├── urls.py
│   │   └── tests.py             # Case uniqueness & delete permission tests
│   ├── activity_logs/           # Immutable Audit Logging
│   │   ├── models.py            # ActivityLog (Immutable, no delete/update)
│   │   ├── serializers.py
│   │   ├── views.py             # ActivityLogListView (Admin only)
│   │   └── urls.py
│   ├── dashboard/               # Aggregated Dashboard Statistics
│   │   ├── views.py             # Role-specific real metrics API
│   │   └── urls.py
│   └── reports/                 # Reports & CSV Export
│       ├── views.py             # ReportsOverviewView (Logs download activity)
│       └── urls.py
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js       # Alaala brand tokens (slate/gold)
    ├── postcss.config.js
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx              # Providers & router root
        ├── main.jsx
        ├── index.css            # Custom scrollbars & glassmorphism
        ├── components/
        │   ├── Navbar.jsx       # Global case search & active/idle pill
        │   ├── Sidebar.jsx      # Responsive desktop/tablet/mobile navigation
        │   ├── Modal.jsx        # Animated accessible dialog
        │   ├── ConfirmDialog.jsx# Destructive action safety modal
        │   └── BadgesAndCards.jsx # Metric cards, status and role badges
        ├── context/
        │   ├── AuthContext.jsx  # JWT state, presence & heartbeat listener
        │   └── ToastContext.jsx # Framer Motion notifications
        ├── pages/
        │   ├── Login.jsx        # Professional login screen
        │   ├── Dashboard.jsx    # Real-time role-tailored dashboard
        │   ├── Users.jsx        # User management with action menus
        │   ├── CreateUserModal.jsx # User provisioning modal
        │   ├── UserModals.jsx   # Edit user & password reset modals
        │   ├── UserMonitoring.jsx # 10s auto-polling live status table
        │   ├── ActivityLog.jsx  # Searchable audit trail
        │   ├── LoginHistory.jsx # Device, IP, and login attempt tracker
        │   ├── Cases.jsx        # Funeral case directory
        │   ├── CreateCase.jsx   # Multi-step case intake form
        │   ├── CaseDetails.jsx  # Printable dossier & audit stamp
        │   ├── EditCase.jsx     # Case update form
        │   ├── Reports.jsx      # CSV download & executive summaries
        │   ├── Settings.jsx     # Organization & session settings
        │   └── NotFound.jsx     # 404 handler
        ├── layouts/
        │   └── MainLayout.jsx
        ├── routes/
        │   ├── AppRoutes.jsx
        │   └── ProtectedRoute.jsx
        ├── services/
        │   ├── api.js           # Axios instance with JWT interceptors
        │   ├── authService.js
        │   ├── userService.js
        │   ├── caseService.js
        │   └── extraServices.js # Activity, Dashboard & Report services
        └── utils/
            └── formatters.js    # Date, Currency (PHP), and Badge styles
```

---

## ⚡ Quick Start (Windows)

Because you develop on Windows, a one-click startup batch script is provided:

1. Double-click **`open_funeral_system.bat`** in the project root.
2. The script will automatically:
   - Verify Python and Node.js
   - Run any pending Django database migrations (`python manage.py migrate`)
   - Launch the Django REST backend at `http://127.0.0.1:8000/` in a dedicated terminal
   - Launch the Vite React frontend at `http://localhost:5173/` in a dedicated terminal
   - Automatically launch your default browser to `http://localhost:5173/`

---

## 🚀 Manual Installation & Setup

### Prerequisites
- **Python**: 3.10, 3.11, or 3.12
- **Node.js**: 18, 20, or 22+
- **npm** or **pnpm**
- **Git**

### Step 1: Clone and Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows cmd: `copy .env.example .env`)*

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (initializes SQLite or PostgreSQL)
python manage.py migrate

# Create the Master Admin account securely
python manage.py setup_master_admin

# Optional: Seed realistic demo funeral cases
python manage.py seed_demo_data

# Start the Django development server
python manage.py runserver 127.0.0.1:8000
```

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit **`http://localhost:5173/`** in your browser to log in.

---

## 🔑 Secure Master Admin Creation

**No default passwords** (such as `admin123`) are hard-coded in this application.

To set up the Master Admin account:
```bash
python manage.py setup_master_admin
```
The interactive command will prompt for:
1. Master Admin Username
2. Full Legal Name (e.g. `Chief Director Maria Santos`)
3. Secure Password (masked with `getpass`, minimum 8 characters)
4. Password Confirmation

Alternatively, for headless deployment pipelines (Docker / CI), specify via environment variables:
```env
MASTER_ADMIN_USERNAME=chiefadmin
MASTER_ADMIN_FULL_NAME=Chief Administrator
MASTER_ADMIN_PASSWORD=YourSuperSecurePassword2026!
```
and run `python manage.py setup_master_admin`.

---

## 🧪 Automated Testing

The backend includes a comprehensive automated test suite covering all critical security and business logic requirements:
```bash
cd backend
python manage.py test
```

### Covered Test Cases
1. `test_login_successful`: Authentic user receives JWT tokens, logs activity & login history.
2. `test_login_wrong_password`: Rejects invalid credentials and logs failed security attempt.
3. `test_login_inactive_account`: Blocks deactivated users with message: *"This account has been deactivated. Please contact an administrator."*
4. `test_master_admin_can_create_admin_and_staff`: Master Admin privileges verified.
5. `test_admin_cannot_create_master_admin_or_admin`: Admin privilege escalation prevented.
6. `test_staff_cannot_create_or_view_users`: Staff restricted from user management.
7. `test_master_admin_cannot_be_deleted`: Master Admin protection prevents deletion.
8. `test_admin_cannot_delete_master_admin`: Cross-role deletion protection.
9. `test_master_admin_cannot_be_deactivated`: Master Admin cannot be deactivated.
10. `test_user_activation_and_deactivation`: Toggling active status synchronizes `is_active`.
11. `test_unauthorized_api_requests`: Rejects unauthenticated requests with HTTP 401.
12. `test_case_creation_by_staff`: Operations staff can record cases.
13. `test_duplicate_case_number_rejected`: Exact message: *"Case Number already exists."*
14. `test_case_search_endpoint`: Real database search by case number and deceased name.
15. `test_staff_cannot_delete_case`: Staff deletion blocked with HTTP 403 Forbidden.
16. `test_admin_can_soft_delete_case`: Admin can soft-delete cases and audit log is created.

---

## 🗄️ Database Configuration

### Development Mode (Default)
Out of the box, `settings.py` falls back to **SQLite** (`backend/db.sqlite3`) if no `DATABASE_URL` is provided. You do not need to install or run PostgreSQL to start local development immediately.

### Production Mode (PostgreSQL)
In production, set `DATABASE_URL` in your environment:
```env
DATABASE_URL=postgres://username:password@hostname:5432/alaala_db
```
or use individual variables:
```env
DB_NAME=alaala_db
DB_USER=alaala_admin
DB_PASSWORD=your_strong_password
DB_HOST=localhost
DB_PORT=5432
```

---

## 🐳 Docker Deployment

The repository includes a multi-stage `Dockerfile` and `docker-compose.yml` for automated containerized deployment:

```bash
# Start PostgreSQL and Django containerized
docker-compose up -d --build

# Run migrations inside container
docker-compose exec backend python manage.py migrate

# Create initial Master Admin inside container
docker-compose exec backend python manage.py setup_master_admin
```

---

## 🌐 Production Deployment Guide

### Building the Frontend
Before deploying to production, compile the optimized static assets:
```bash
cd frontend
npm run build
```
This generates the optimized bundle in `frontend/dist/`.

### Serving with WhiteNoise
The Django backend is pre-configured with **WhiteNoise** for self-contained, lightning-fast static asset serving. In production:
```bash
cd backend
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### Deploying to Cloud Platforms (Render / Railway / DigitalOcean)
1. **Backend Service**:
   - Build Command: `pip install -r backend/requirements.txt && python backend/manage.py collectstatic --noinput`
   - Start Command: `cd backend && gunicorn config.wsgi:application`
   - Environment Variables:
     - `DJANGO_SECRET_KEY`: Random 50+ character string
     - `DEBUG`: `False`
     - `ALLOWED_HOSTS`: `your-backend.onrender.com,your-domain.com`
     - `DATABASE_URL`: Your managed PostgreSQL connection URI
     - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
     - `CSRF_TRUSTED_ORIGINS`: `https://your-frontend.vercel.app`
2. **Frontend Service (Vercel / Netlify / Cloudflare Pages)**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 🔒 Security Summary

1. **Authentication**: Stateless JWT with access tokens (120-min default) and refresh tokens (7-day default with token rotation and blacklisting).
2. **User Monitoring**: Client emits heartbeat every 25 seconds; backend dynamically evaluates `ACTIVE`, `IDLE` (> 3 mins), and `INACTIVE` (> 15 mins or logged out).
3. **Immutability of Activity Logs**: Overridden `.delete()` and `.update()` on the `ActivityLog` model ensure the audit trail cannot be modified or destroyed by anyone.
4. **Master Admin Safeguard**: Hardened at both the ORM model level and serializer/permission level against deactivation, role demotion, and deletion.
5. **Admin-Only Deletion**: Staff attempts to delete funeral records or users are rejected with HTTP 403 Forbidden.

---

## 📄 License & Attribution

Designed and developed for **Alaala Funeral Homes**.  
Proprietary & Confidential. All rights reserved.
