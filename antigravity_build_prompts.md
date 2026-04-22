# Building Real Estate DBMS from Scratch: Antigravity Prompts

If you were to completely rebuild this project from the ground up using the Antigravity AI Code Editor, you could use the following 9 sequential prompts to guide the AI step-by-step through the Database, Backend, and Frontend layers. 

## Phase 1: Database & Backend Foundation

**Prompt 1: Raw SQL Database Architecture**
> "Set up a new workspace. Create a comprehensive `schema.sql` file for a MySQL 8 real estate database. Define tables for Users, Customers (Buyers/Tenants), Agents, Owners, Properties, Notifications, Sales, and Rents. Enforce strict Database integrity: use exact Primary/Foreign Key relations, `ON DELETE CASCADE` rules, and create a trigger named `check_overlapping_rent` that prevents overlapping lease dates by throwing an early `SQLSTATE` error."

**Prompt 2: Django Backend Initialization & ORM Bypass**
> "Initialize a new Django project (REST Framework). We are using a 'Database-first' approach. Create the Django `models.py` representations matching the SQL schema, but explicitly set `managed = False` for all models. We want Django to only act as an API bridge, not the database manager. Ensure connection settings map to our existing MySQL database."

**Prompt 3: Custom Authentication Strategy**
> "Implement JSON Web Token (JWT) stateless authentication inside Django. Build a `RegisterView` endpoint that accepts a user and a role, creates the core authentication row, and appropriately inserts into the specific MySQL sub-table (e.g., Buyer or Tenant). Require the JWT to be verified on all modifying API endpoints."

## Phase 2: Core Workflows & Logic

**Prompt 4: Customer Marketplace API**
> "Build the Customer exploration endpoints in Django. Create an API view (`/api/properties/`) that queries the `Property` table for rows where `current_status = 'available'`. Set up the serialization to pass this accurately as JSON. Additionally, create a POST interaction point where a customer can submit an inquiry, generating a row in the `Notification` table assigned to the property's underlying Agent."

**Prompt 5: Agent Transaction & Deal APIs**
> "Create the Agent Intelligence Hub endpoints. First, build a GET endpoint to return all `Notification` inquiries where `receiver_id` matches the authenticated Agent. Secondly, build a `ConfirmNotificationView` execution endpoint that securely inserts a record into the `Sale` or `Rent` table, and subsequently forces an `UPDATE` to change the corresponding property's status to 'sold' or 'rented'."

**Prompt 6: High-Performance Database Analytics**
> "Build an Analytics Engine API for the Office Administrator. Instead of pulling all data to Python, write complex aggregations and `GROUP BY` logic directly through MySQL inside the Django view (e.g., finding the top agent by SUM revenue, calculating average property turn-around time). Return only the compacted KPI numbers to save memory."

## Phase 3: Premium Frontend Integration

**Prompt 7: React SPA Initialization & Glassmorphic UI Foundation**
> "Initialize the frontend using React and Vite. Develop a globally accessible, highly premium 'Liquid Glass' UI (glassmorphic theme, deep purples, smooth modern typography, and hover micro-animations). Set up routing structure and create a foundational `axios` API service interceptor to securely attach JWT tokens to every outbound HTTP request."

**Prompt 8: Customer & Agent Interface Development**
> "Develop the primary React interfaces. First, build the `/marketplace` page showcasing real-time fetched property cards with an elegant UI and 'Buy/Rent' buttons that dispatch the correct API payloads. Next, build an Agent Dashboard fetching the agent's notifications, complete with actionable buttons to finalize the real estate deals that communicate back to our Django endpoints."

**Prompt 9: The Admin Dashboard & SQL Passthrough Interface**
> "Create the final piece: the comprehensive Office Administrator Analytics Dashboard. Integrate charting libraries to visualize the backend KPI data beautifully. Crucially, build an 'SQL Console' component: a direct raw-text input field that posts custom query strings to the backend. The backend must use Django's raw connection cursor to execute the DML/DDL and spit the dynamic arrays cleanly back to React's state tables."
