# Real Estate DBMS: Complete System Workflow

Based on the architecture of the Real Estate DBMS project, here is a detailed breakdown of how the entire website works, how data is fetched, processed, and how actions are executed across the system:

## 🏗️ 1. The High-Level Architecture (How They Connect)
The system operates on a standard **3-Tier Architecture**:
1. **Frontend (React + Vite):** This is the user interface. It holds no permanent data and is strictly used for rendering the layout, capturing user clicks/forms, and managing temporary sessions (using JWT tokens).
2. **Backend API (Django REST Framework):** This is the middleman. It receives requests from the React frontend, validates permissions (e.g., "Is this person an agent or an admin?"), packages JSON data, and handles the logic connecting Python to SQL.
3. **Database (MySQL 8):** This is the single source of truth for all data. It handles all heavy lifting, including complex constraints, enforcing rules via triggers, and executing fast aggregations (math).

---

## 🔄 2. The Step-by-Step Workflows (How Actions Happen)

Here is exactly how the workflows resolve depending on the type of user interacting with the website:

### A. The Customer Workflow (Buyers / Tenants)
1. **Registration:** A user goes to the site and fills out a signup form, selecting if they are a "Buyer" or "Tenant."
   - **Under the hood:** The React frontend sends a `POST` request. The Django backend creates an authorization profile and uniquely forces an `INSERT` into the exact MySQL `Buyer` or `Tenant` table.
2. **Data Fetching (Exploration):** The customer loads the `/marketplace` page. 
   - **Under the hood:** The frontend hits an endpoint (`GET /api/properties/`). Django immediately queries MySQL with a command like `SELECT * FROM Property WHERE current_status = 'available'` and returns the listings in JSON format to be rendered as property cards.
3. **Action Execution (Inquiry):** The user finds a property they like and clicks "Buy" or "Rent". 
   - **Under the hood:** A new record is injected into a `Notification` table inside the database. This explicitly links the `customer_id` making the request to the specific `agent_id` managing that property.

### B. The Agent Workflow (Managing Properties)
1. **Data Fetching (Intelligence Hub):** An agent logs securely into their dashboard.
   - **Under the hood:** To populate their dashboard, the backend runs a query on the `Notification` table: `SELECT * FROM Notification WHERE receiver_id = <their_agent_id>`. This fetches all their pending inquiries.
2. **Action Execution (Deal Finalization):** The agent clicks "Approve Tenant" or "Close Sale".
   - **Under the hood:** A highly critical API view fires in Python. First, it forces an `INSERT` into either the `Rent` or `Sale` table. Immediately after, it safely updates the property's state: `UPDATE Property SET current_status = 'sold' (or 'rented') WHERE property_id = X`.

### C. The Administrator/Office Workflow
1. **Data Processing (Analytics Engine):** The admin views a massive statistical dashboard.
   - **Under the hood:** Rather than downloading raw rows of properties and doing math in Python (which uses too much memory), Django shifts the computation burden entirely to MySQL. It executes complex queries like `SELECT agent_id, SUM(final_price) FROM Sale GROUP BY agent_id`. MySQL does the math internally and only passes the final, tiny KPI variables back across the network to draw the React charts.
2. **Action Execution (Direct Governance):** The Admin submits a direct database command using an exposed "SQL Console." 
   - **Under the hood:** The provided text crosses the API, hits Django's pure connection cursor (`connection.cursor().execute()`), bypasses Django models, runs directly on MySQL, and routes results safely back to the user.

---

## 🛡️ 3. How the Data is Protected and Validated

The overarching philosophy of this application is **Database strictness**. 
* **State Management:** The backend relies entirely on **JSON Web Tokens (JWT)**. When you log in, Django mathematically signs a token containing your User ID and Role. React sends this token with every request, allowing Django to instantly know who you are without complex session tracking.
* **Race Conditions:** If two agents somehow try to rent the same property simultaneously, Django doesn't process it. Instead, customized **MySQL Triggers** step in. For example, a `check_overlapping_rent` trigger listens to the database. It compares lease dates instantly, and if a collision occurs, it blocks the `INSERT` at the lowest level, sending an error safely backward through Django to alert React. 
