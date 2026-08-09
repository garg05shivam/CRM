# Mini ERP + CRM Operations Portal

A full-stack Operations Portal built for wholesale and distribution businesses. This application provides real-world business workflows covering Customer CRM, Follow-up tracking, Product and Warehouse Management, Stock Movements, Low-Stock Alerting, Sales Challan Generation, and User Management with strict Role-Based Access Control (RBAC).

---

## Table of Contents

1. [Key Features](#key-features)
2. [Role-Based Access Control](#role-based-access-control)
3. [Demo Credentials](#demo-credentials)
4. [Core Business Workflow](#core-business-workflow)
5. [Technology Stack](#technology-stack)
6. [Architecture & Repository Structure](#architecture--repository-structure)
7. [Database Overview](#database-overview)
8. [Local Development Setup](#local-development-setup)
9. [Environment Variables](#environment-variables)
10. [Testing Checklist](#testing-checklist)
11. [Security Features](#security-features)
12. [Deployment Guide](#deployment-guide)
13. [Known Limitations & Assumptions](#known-limitations--assumptions)
14. [Project Status](#project-status)
15. [Future Improvements](#future-improvements)
16. [License](#license)

---

## Key Features

* **Authentication & Role-Based Control**: Secure JWT authentication supporting four distinct operational roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
* **Customer CRM & Follow-ups**: Customer profile management (`Lead`, `Active`, `Inactive`), customer type categorization (`Retail`, `Wholesale`, `Distributor`), GST tracking, and audit-logged follow-up notes.
* **Product & Warehouse Inventory**: Multi-warehouse tracking, SKU enforcement, unit pricing, minimum stock alert thresholds, and low-stock dashboards.
* **Stock Movement Tracking**: Logged `IN` and `OUT` inventory transactions with reason tracking, user attribution, and timestamping.
* **Sales Challan Module**: Multi-product challan drafting (`CH-<timestamp>-<rand>`), price snapshotting, and transaction-locked stock deduction upon confirmation.
* **User Management**: Administrator panel to create internal users, assign operational roles, and toggle user active status.
* **Server-Side Pagination & Filtering**: Offsets and limits on list APIs along with search and multi-attribute filters.

---

## Role-Based Access Control

Access control is enforced at both layers: frontend navigation routes (`RoleRoute`) dynamically restrict visible pages, while backend middleware (`authorizeRoles`) validates every API endpoint request against the authenticated user's JWT payload.

| Feature / Module | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Customers CRM** | ✅ | ✅ | ❌ | ✅ |
| **CRM Follow-ups** | ✅ | ✅ | ❌ | ❌ |
| **Products** | ✅ | ✅ | ✅ | ✅ |
| **Warehouses** | ✅ | ❌ | ✅ | ❌ |
| **Inventory Movements** | ✅ | ❌ | ✅ | ❌ |
| **Sales Challans** | ✅ | ✅ | ❌ | ✅ |
| **User Management** | ✅ | ❌ | ❌ | ❌ |

---

## Demo Credentials

The following development/demo credentials are pre-seeded in the database for testing role capabilities:

> ⚠️ **Note**: These accounts are provided exclusively for demonstration, testing, and evaluation purposes. Do not use these credentials or secrets in production environments.

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@crm.local` | `Admin@12345` | Complete administrative access to all system modules and user management |
| **SALES** | `sales@crm.local` | `Sales@12345` | Customer management, follow-ups, product viewing, challan creation & confirmation |
| **WAREHOUSE** | `warehouse@crm.local` | `Warehouse@12345` | Product management, warehouse management, stock movements, and low stock monitoring |
| **ACCOUNTS** | `accounts@crm.local` | `Accounts@12345` | Customer viewing, product viewing, sales challan auditing |

---

## Core Business Workflow

The system models a complete distribution flow:

```
Customer Entry → Product & Warehouse Setup → Stock IN Movement → Sales Challan (DRAFT) → Challan Confirmation → Automatic Stock OUT → Inventory Updated
```

1. **Setup**: A customer profile is created under CRM, and products are registered to specific warehouses with minimum stock thresholds.
2. **Stock Provisioning**: Warehouse personnel log a `Stock IN` movement, updating current product stock.
3. **Challan Creation**: Sales users build a `DRAFT` Sales Challan selecting a customer and product quantities. Product prices and names are snapshotted to preserve historical record integrity.
4. **Challan Confirmation**: Confirming the challan triggers an explicit database transaction (`BEGIN...COMMIT`) with row-level locks (`FOR UPDATE`).
5. **Stock Deduction**:
   * Stock is reduced based on items in the confirmed challan.
   * A corresponding `Stock OUT` movement is automatically logged in `stock_movements`.
   * If stock is insufficient for any requested product, the database transaction rolls back and returns an HTTP 400 error (`INSUFFICIENT_STOCK`). Product stock cannot become negative.

---

## Technology Stack

### Backend
* **Runtime & Framework**: Node.js, Express.js
* **Language**: TypeScript
* **Database Driver**: PostgreSQL (`pg` pool connection)

### Validation & Security
* **Input Validation**: Zod
* **Security Headers**: Helmet
* **Cross-Origin Handling**: CORS
* **Hashing & Tokens**: bcrypt, JSON Web Token (jsonwebtoken)

### Frontend
* **Core Framework**: React 18, TypeScript, Vite
* **Routing**: React Router DOM
* **Styling**: Custom CSS design system (Glassmorphism theme, CSS custom properties, responsive layout)

---

## Architecture & Repository Structure

```
CRM/
├── backend/
│   ├── src/
│   │   ├── auth/           # JWT creation, verification & password helpers
│   │   ├── config/         # Environment variable mapping
│   │   ├── customers/      # Customer CRM routes, controllers, & services
│   │   ├── dashboard/      # System metric summaries & aggregated endpoints
│   │   ├── db/             # Migration SQL files (001_initial_schema.sql)
│   │   ├── follow-ups/     # CRM follow-up note endpoints
│   │   ├── inventory/      # Stock movement logs & low stock queries
│   │   ├── middlewares/    # Authentication, RBAC, and error handlers
│   │   ├── products/       # Product catalog CRUD & query services
│   │   ├── sales-challans/ # Sales challan transactions & snapshot logic
│   │   ├── scripts/        # Seeding utility (seed-users.ts)
│   │   ├── users/          # Administration user management routes
│   │   ├── utils/          # Pagination parsing & query builders
│   │   ├── warehouses/     # Warehouse location management
│   │   └── server.ts       # Express application entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── api/            # Typed HTTP API client functions
    │   ├── components/     # UI components (PaginationControls, modals)
    │   ├── context/        # AuthContext for session management
    │   ├── layouts/        # AppLayout navigation frame & header
    │   ├── pages/          # Dashboard, Customers, Products, Inventory, etc.
    │   ├── routes/         # ProtectedRoute and RoleRoute route guards
    │   ├── types/          # Shared TypeScript interfaces
    │   ├── App.tsx         # Route configuration
    │   └── index.css       # Design tokens & responsive styles
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

---

## Database Overview

The PostgreSQL database schema consists of the following relational tables:

* `users`: User credentials, names, assigned `user_role` enum (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`), and active status flags.
* `warehouses`: Warehouse location records and status flags.
* `customers`: Detailed customer records, contact info, `customer_type` enum (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), and `customer_status` enum (`LEAD`, `ACTIVE`, `INACTIVE`).
* `customer_follow_ups`: Date-stamped notes linked to customers and attributed to internal users.
* `products`: Product items linked to warehouses via foreign key constraints, containing SKUs, prices, stock levels, and minimum stock alerts.
* `stock_movements`: Immutable log of stock quantity changes, tracking movement type (`IN` / `OUT`), reason, user attribution, and timestamp.
* `sales_challans`: Header table for sales challans tracking customer, total quantity, status (`DRAFT`, `CONFIRMED`, `CANCELLED`), and authoring user.
* `sales_challan_items`: Line items storing product IDs alongside frozen snapshot values (`product_name_snapshot`, `sku_snapshot`, `unit_price_snapshot`) and item quantities.

---

## Local Development Setup

Follow these steps to configure and run the project locally.

### Prerequisites
* **Node.js**: v18.x or higher
* **npm**: v9.x or higher
* **PostgreSQL**: v14.x or higher

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/CRM.git
   cd CRM
   ```

2. **Database Setup**:
   Open PostgreSQL prompt or tool and create the target database:
   ```sql
   CREATE DATABASE crm_db;
   ```

3. **Execute Database Migration**:
   Run the initial schema SQL script against `crm_db`:
   * **PowerShell**:
     ```powershell
     psql -U postgres -d crm_db -f backend/src/db/migrations/001_initial_schema.sql
     ```
   * **Bash**:
     ```bash
     psql -U postgres -d crm_db -f backend/src/db/migrations/001_initial_schema.sql
     ```

4. **Configure Backend Environment**:
   Navigate to `backend` and create `.env` from template:
   ```bash
   cd backend
   cp .env.example .env
   ```

5. **Install Backend Dependencies**:
   ```bash
   npm install
   ```

6. **Seed Initial Demo Users**:
   Populate the default test accounts:
   ```bash
   npm run seed:users
   ```

7. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   *Backend starts at `http://localhost:5000`.*

8. **Configure Frontend Environment**:
   Open a new terminal, navigate to `frontend`, and create `.env`:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```

9. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

10. **Start Frontend Client**:
    ```bash
    npm run dev
    ```
    *Frontend application opens at `http://localhost:5173`.*

---

## Environment Variables

> 🔒 **Security Notice**: Never commit `.env` files containing live credentials or production secrets to version control. Use `.env.example` as a template.

### Backend (`backend/.env.example`)
```ini
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/crm_db
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

### Frontend (`frontend/.env.example`)
```ini
VITE_API_URL=http://localhost:5000
```

---

## Testing Checklist

Use this functional verification checklist to validate system behavior:

- [ ] **Role Authentication**: Login individually with `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` credentials.
- [ ] **Navigation Boundaries**: Verify sidebar links adjust dynamically per role permissions.
- [ ] **Route Protection**: Attempt direct browser URL navigation to restricted pages (e.g. `/users` as `SALES`) to confirm redirect behavior.
- [ ] **Customer Operations**: Create a customer, update profile details, perform keyword search, and view detailed customer card.
- [ ] **Follow-up Management**: Add follow-up notes to a customer record and verify user attribution.
- [ ] **Product Catalog**: Add a product, update unit price, and filter by warehouse.
- [ ] **Warehouse Access**: View warehouse list and active status.
- [ ] **Stock Movement IN**: Log a `Stock IN` movement and verify current stock increments.
- [ ] **Stock Movement OUT**: Attempt a `Stock OUT` exceeding current stock to verify error prevention.
- [ ] **Low Stock Alerts**: Lower product stock below alert threshold and verify appearance on low stock view.
- [ ] **Sales Challan Flow**: Draft a sales challan containing multiple items.
- [ ] **Challan Confirmation**: Confirm a `DRAFT` challan; verify stock decreases automatically and a `Stock OUT` movement entry is generated.
- [ ] **User Management**: Log in as `ADMIN`, create a user, toggle user active state, and verify disabled users cannot log in.
- [ ] **Session Persistence**: Refresh the application browser tab to confirm JWT session state persists correctly.

---

## Security Features

* **JWT Authentication**: Stateless, signed bearer token validation on API endpoints.
* **Password Security**: Passwords hashed using `bcrypt` with salt rounds before database insertion.
* **Schema Validation**: All inbound HTTP request payloads strictly parsed via `Zod` schemas.
* **HTTP Security**: Express application hardened with `Helmet` security headers and configured `CORS`.
* **Database Safety**: Parameterized SQL queries preventing SQL injection attacks across all database services.
* **Concurrency Controls**: `FOR UPDATE` PostgreSQL row locks during sales challan confirmation preventing race conditions.
* **Non-Negative Constraints**: Check constraints at database layer ensuring `current_stock >= 0`.

---

## Deployment Guide

### Overview
When deploying to cloud platforms (e.g. Render, Railway, Fly.io, Vercel, Netlify):

1. **Database**: Use a managed PostgreSQL service (e.g. Supabase, Neon, Render Postgres) instead of `localhost`. Run `001_initial_schema.sql` on the provisioned database.
2. **Backend**:
   * Set `NODE_ENV=production`.
   * Provide production `DATABASE_URL` and a strong `JWT_SECRET`.
   * Build command: `npm run build`
   * Start command: `node dist/server.js`
3. **Frontend**:
   * Configure `VITE_API_URL` environment variable pointing to the deployed backend URL.
   * Build command: `npm run build`
   * Output directory: `dist`
4. **CORS**: Ensure backend CORS origin settings permit requests from the production frontend domain.

---

## Known Limitations & Assumptions

* **Stock OUT Attribution**: Stock reduction from challan confirmation automatically logs a stock movement record with reason *"Sales challan confirmation"*.
* **Tax Calculations**: GST fields are captured on customer profiles for record-keeping; dynamic tax line calculation on invoices is not included.
* **Local Development Focus**: Database migrations are managed via single initial schema script `001_initial_schema.sql`.

---

## Project Status

The application has completed end-to-end functional testing across all four operational roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) and core business modules (Customer CRM, Follow-ups, Products, Warehouses, Inventory Movements, Sales Challans, and User Management).

---

## Future Improvements

* PDF export utility for confirmed Sales Challans.
* Product image file upload integration with cloud storage (e.g. AWS S3).
* Containerized setup utilizing `Dockerfile` and `docker-compose`.
* Automated CI/CD build workflows via GitHub Actions.

---

## License

This project is open-source and available under the [ISC License](backend/package.json).
