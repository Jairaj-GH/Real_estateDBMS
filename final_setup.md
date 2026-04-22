# 🚀 Real Estate DBMS: Complete Setup Guide

This guide provides a comprehensive walkthrough for installing and synchronizing the full-stack Real Estate Management Platform. The system utilizes a React frontend, Django REST API backend, and a high-performance MySQL 8.0 database with custom triggers.

---

## 🛠️ Prerequisites
Before starting, ensure your system is equipped with the following:

| Core Technology | Supported Version | Download link |
| :--- | :--- | :--- |
| **Python** | 3.10 or higher | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| **MySQL Server** | 8.0 or higher | [mysql.com](https://dev.mysql.com/downloads/installer/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

**Windows Users:** Ensure you install the [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) if you encounter `mysqlclient` compilation errors.

---

## 🗃️ Phase 1: Database Initialization
The application relies strictly on MySQL for handling heavy transactional integrity via custom schema triggers and foreign keys.

1. **Access MySQL Shell**: Open your terminal and log into your MySQL server.
   ```bash
   mysql -u root -p
   ```

2. **Execute the Schema Script**:
   Locate your absolute path to the project's repository. Run the schema creation script.
   ```sql
   -- Create the overarching database and execute the schema initialization:
   SOURCE d:\Coding\college\sem-4\dbms\sql_website\Jai_s_website\Real_estateDBMS\schema.sql;
   ```

3. **Verify Integrity**:
   Verify everything was established correctly:
   ```sql
   USE DBPROJECT;
   SHOW TABLES;
   ```
   *(You should see precisely 7 core tables: `Agent`, `Buyer`, `Owner`, `Property`, `Rent`, `Sale`, `Tenant`)*

---

## 🐍 Phase 2: Django Backend Setup
The backend serves as the secure intelligence interface between the React frontend and legacy MySQL tables.

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Initialize a Virtual Environment**:
   It is heavily recommended to use a virtual environment to isolate dependencies.
   ```bash
   python -m venv venv
   
   # Activate Environment (Windows):
   .\venv\Scripts\activate
   
   # Activate Environment (MacOS/Linux):
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Synchronize Environment Secrets**:
   - Duplicate the `.env.example` file and rename it to `.env`.
   - Embed your MySQL authentication credentials inside:
   ```env
   DB_NAME=DBPROJECT
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   SECRET_KEY=your_secure_randomly_generated_string
   ```

5. **Deploy System Migrations**:
   Django must construct its internal administrative and authentication tables alongside your custom real estate tables.
   ```bash
   python manage.py migrate
   ```

6. **Seed Initial Identities (Required)**:
   You must map the existing MySQL entities to Django login accounts using our automated seeder.
   ```bash
   python manage.py setup_demo
   # OR
   python manage.py shell -c "from auth_seed import seed; seed()"
   ```

---

## ⚛️ Phase 3: React Frontend Pipeline
The frontend delivers the sophisticated, glassmorphic interactions to users.

1. **Navigate to the Frontend Directory**:
   ```bash
   cd ../frontend
   ```

2. **Hydrate Node Modules**:
   ```bash
   npm install
   ```

3. **Launch the Interface**:
   ```bash
   npm run dev
   ```

---

## 🚀 Execution & Operating Modes
For the CRM system to correctly identify routes, **both environments must be actively running**.

**Terminal 1 (Intelligence Engine - Backend)**:
```bash
cd backend
# Ensure venv is active
python manage.py runserver
```

**Terminal 2 (Client UI - Frontend)**:
```bash
cd frontend
npm run dev
```

---

## 🔑 Authority Credentials
During the user seeding sequence (Phase 2), specific mock accounts were established to allow testing across all vertical dashboards.

| Clearances / Role | Identity Sign-in | Cipher (Password) |
| :--- | :--- | :--- |
| **🛡️ System Administrator** | `admin@realestate.com` | `admin123` |
| **🏢 Executive Office** | `office@realestate.com` | `office123` |
| **👔 Top Agent Test** | `devil@gmail.com` | `agent123` |
| **👤 Tenant Customer**| `tenant1@example.com` | `customer123`|
