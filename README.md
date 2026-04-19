# 🏡 Real Estate Management System

A full-stack web application for managing real estate operations in Guwahati, built with **Django + React**. Supports four user roles: Office Staff, Agent, Customer, and Admin.

---

## 📁 Project Structure

```
real_estate/
├── backend/                    # Django project
│   ├── real_estate_project/    # Django settings & URLs
│   ├── api/                    # Models, views, serializers, URLs
│   │   └── management/commands/seed_users.py
│   ├── authentication/         # UserProfile model + JWT views
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example            # Copy to .env
├── frontend/                   # React (Vite) project
│   ├── src/
│   │   ├── api/axios.js        # Axios client with JWT
│   │   ├── context/AuthContext.jsx
│   │   ├── components/         # Layout, ProtectedRoute
│   │   └── pages/              # Login, OfficeDashboard, AgentDashboard,
│   │                           #   CustomerDashboard, AdminDashboard, About
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── schema.sql                  # Full MySQL schema + triggers + sample data
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| pip | latest |
| npm | 9+ |

---

## 🗄️ Step 1 – Set Up the MySQL Database

```bash
# Log into MySQL
mysql -u root -p

# Run the full schema (creates DB, tables, triggers, sample data)
source /path/to/real_estate/schema.sql;

# Verify tables
USE real_estate_db;
SHOW TABLES;
SHOW TRIGGERS;
```

---

## 🐍 Step 2 – Set Up the Django Backend

```bash
cd real_estate/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and a secret key:
#   DB_NAME=real_estate_db
#   DB_USER=root
#   DB_PASSWORD=your_mysql_password
#   DB_HOST=localhost
#   DB_PORT=3306
#   SECRET_KEY=your-very-random-secret-key-here

# Run Django migrations (creates auth_user, auth_user_profile tables only)
python manage.py migrate

# Create demo users for all 4 roles
python manage.py seed_users

# (Optional) Create Django superuser for /django-admin/ panel
python manage.py createsuperuser

# Start the development server
python manage.py runserver
# → API available at http://localhost:8000/api/
```

---

## ⚛️ Step 3 – Set Up the React Frontend

```bash
cd real_estate/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → App available at http://localhost:5173/
```

---

## 👤 Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Office Staff** | office@realestate.com | office123 | Sales & rental reports |
| **Agent** | agent1@realestate.com | agent123 | Mark properties sold/rented |
| **Customer** | buyer1@example.com | customer123 | Browse & search properties |
| **Admin** | admin@realestate.com | admin123 | Full access + SQL console |

> The Login page has quick-fill buttons for all demo accounts.

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api/`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/token/` | Login – returns JWT access + refresh tokens |
| `POST` | `/token/refresh/` | Refresh access token |
| `GET` | `/current-user/` | Get logged-in user info + role |

### Properties
| Method | Endpoint | Permissions |
|--------|----------|-------------|
| `GET` | `/properties/` | All authenticated · Filters: city, locality, status, min/max price, bedrooms, search |
| `GET` | `/properties/{id}/` | All authenticated · Returns owner, agent, active rent, sale info |
| `GET` | `/properties/meta/` | All · Returns distinct cities, localities, types |

### Agent Operations
| Method | Endpoint | Permissions |
|--------|----------|-------------|
| `POST` | `/sales/` | Agent, Admin |
| `POST` | `/rents/` | Agent, Admin |
| `POST` | `/rents/check-overlap/` | Agent, Admin |
| `GET` | `/buyers/` | Agent, Admin |
| `POST` | `/buyers/` | Agent, Admin |
| `GET` | `/tenants/` | Agent, Admin |
| `POST` | `/tenants/` | Agent, Admin |
| `GET` | `/my-transactions/` | Agent, Admin |

### Office Reports
| Method | Endpoint | Permissions |
|--------|----------|-------------|
| `GET` | `/sales-report/` | Office, Admin |
| `GET` | `/rental-report/` | Office, Admin · Filter: `?locality=Ulubari` |
| `GET` | `/agents/` | Office, Admin |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/sql/` | Execute raw SQL |
| `GET` | `/admin/stats/` | Database statistics |
| `GET` | `/admin/tables/{table}/` | Browse any table with pagination |
| `GET` | `/admin/users/` | List all system users |
| `POST` | `/admin/users/` | Create new user |
| `PATCH` | `/admin/users/{id}/` | Update role, enable/disable |
| `DELETE` | `/admin/users/{id}/` | Delete user |

---

## 🗄️ Database Schema

```
Owner ──────────────────────────────────────────────┐
                                                     ↓
Agent ─────────────────────────────────────── Property ──→ Sale  ←── Buyer
                                                     │
                                                     └──────→ Rent ←── Tenant
```

### Active MySQL Triggers

| Trigger | Event | Effect |
|---------|-------|--------|
| `update_status_after_sale_insert` | `AFTER INSERT` on Sale | Sets property status → `'sold'` |
| `update_status_after_sale_delete` | `AFTER DELETE` on Sale | Reverts to `'available'` if no active rent |
| `prevent_overlap_rent_insert` | `BEFORE INSERT` on Rent | Raises error if overlapping dates exist |
| `update_status_after_rent_insert` | `AFTER INSERT` on Rent | Sets status → `'rented'` if CURDATE() in period |
| `update_status_after_rent_delete` | `AFTER DELETE` on Rent | Reverts to `'available'` if no active rent/sale |

---

## 🔐 Environment Variables (`.env`)

```env
SECRET_KEY=your-very-secret-django-key-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=real_estate_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306
```

---

## 🧪 Testing Key Scenarios

### 1. Trigger: Mark as Sold
1. Login as **Agent** → "Mark as Sold"
2. Select an available property, fill buyer/price/date → Submit
3. Verify: property no longer appears in available listings

### 2. Trigger: Overlap Prevention
1. Login as **Agent** → "Mark as Rented"
2. Select a property and dates overlapping an existing rental
3. Expect error: "Overlapping rent period detected"

### 3. Admin SQL Console
1. Login as **Admin** → SQL Console
2. Try: `SELECT * FROM Property WHERE current_status = 'sold';`
3. Try: `SELECT a.name, COUNT(*) FROM Agent a JOIN Sale s ON a.agent_id = s.agent_id GROUP BY a.name;`

### 4. Customer Search
1. Login as **Customer**
2. Filter by City=Guwahati, Status=Available, Bedrooms=2
3. Click any property card to view full detail with owner/agent info

---

## 🚀 Production Build

```bash
# Build React frontend
cd frontend
npm run build

# Collect Django static files
cd ../backend
python manage.py collectstatic

# Use gunicorn + nginx in production
pip install gunicorn
gunicorn real_estate_project.wsgi:application --bind 0.0.0.0:8000
```

---

## 📝 Notes

- **Django models use `managed = False`** – Django will never create/alter/drop the original tables (Owner, Agent, Buyer, Tenant, Property, Sale, Rent).
- **Triggers are respected** – The backend never manually updates `current_status`; all status changes flow through the MySQL triggers.
- **JWT tokens** include the user's `role` and `agent_id` in their payload, enabling instant client-side role-based routing.
- **Overlap checking** is done both in the Django serializer (before insert) and by the MySQL trigger (last line of defense).
