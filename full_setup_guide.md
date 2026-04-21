# 🚀 Real Estate DBMS: Zero-to-Hero Setup Guide

This guide will take you from a fresh installation to a fully functional Real Estate Management System. Follow these steps carefully to ensure the backend, database, and frontend are correctly synchronized.

---

## 🛠️ Prerequisites
Before starting, ensure you have the following installed on your system:

| Tool | Recommended Version | Download link |
| :--- | :--- | :--- |
| **Python** | 3.10 or higher | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| **MySQL** | 8.0 or higher | [mysql.com](https://dev.mysql.com/downloads/installer/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

---

## 🗄️ Step 1: Set Up the Database
The application relies on a MySQL database with specific triggers for property status management.

1.  **Start MySQL**: Open your MySQL Command Line Client or Terminal.
2.  **Create the Schema**:
    Navigate to the root directory where `schema.sql` is located and run:
    ```sql
    -- Log into MySQL
    mysql -u root -p

    -- Run the setup script (replace with your actual path)
    SOURCE d:/Coding/college/sem-4/dbms/sql_website/Jai_s_website/Real_estateDBMS/schema.sql;
    ```
3.  **Verify**:
    ```sql
    USE real_estate_db;
    SHOW TABLES;
    ```
    *You should see tables like `Property`, `Agent`, `Sale`, `Rent`, etc.*

---

## 🐍 Step 2: Configure the Django Backend
The backend handles business logic, JWT authentication, and MySQL interactions.

1.  **Navigate to Backend**:
    ```powershell
    cd backend
    ```
2.  **Create a Virtual Environment**:
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  **Install Dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables**:
    *   Find the `.env.example` file in the `backend/` folder.
    *   **Rename** it to `.env`.
    *   Open `.env` and fill in your MySQL credentials:
    ```env
    DB_NAME=real_estate_db
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_HOST=localhost
    DB_PORT=3306
    SECRET_KEY=any_random_long_string
    ```
5.  **Initialize Django Tables**:
    ```powershell
    python manage.py migrate
    ```
6.  **Seed Demo Users**:
    This step creates the accounts needed to log in.
    ```powershell
    python manage.py seed_users
    ```
    *(Alternatively, you can run `python setup_demo.py` from the root of the backend folder)*

---

## ⚛️ Step 3: Configure the React Frontend
The frontend provides the premium "Liquid Glass" interface.

1.  **Navigate to Frontend**:
    ```powershell
    cd ../frontend
    ```
2.  **Install Node Modules**:
    ```powershell
    npm install
    ```
3.  **Start the Frontend**:
    ```powershell
    npm run dev
    ```
    *The website will now be running at `http://localhost:5173/`.*

---

## 🚀 Step 4: Running the Application
To use the website, you must have **both** terminals running:

1.  **Terminal 1 (Backend)**: `cd backend && python manage.py runserver`
2.  **Terminal 2 (Frontend)**: `cd frontend && npm run dev`

---

## 🔑 Demo Access Credentials
Once the site is running, you can use these accounts to explore the different dashboards:

| Role | Email | Password |
| :--- | :--- | :--- |
| **🛡️ Admin** | `admin@realestate.com` | `admin123` |
| **🏢 Office** | `office@realestate.com` | `office123` |
| **🤝 Agent** | `agent1@realestate.com` | `agent123` |
| **👤 Customer**| `buyer1@example.com` | `customer123`|

---

## ⚠️ Troubleshooting
- **`mysqlclient` installation fails**: On Windows, you may need the [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
- **Database Connection Error**: Ensure the MySQL service is running and your `.env` credentials exactly match your local MySQL setup.
- **Port 5173 or 8000 already in use**: Close any other applications using those ports, or use `npm run dev -- --port 5174` for the frontend.
