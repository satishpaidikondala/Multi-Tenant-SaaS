# Multi-Tenant SaaS Platform

A production-ready, multi-tenant SaaS application with project and task management capabilities. It features strict data isolation, role-based access control (RBAC), and subscription management.

## 🚀 Features

- **Multi-Tenancy**: Data isolation via `tenant_id` and subdomain support.
- **Authentication**: JWT-based stateless auth for security.
- **RBAC**: Three distinct roles: Super Admin, Tenant Admin, User.
- **Project Management**: Create projects, assign tasks, and track status.
- **Subscription Limits**: Enforces user and project limits based on plan (Free, Pro, Enterprise).
- **Dockerized**: Full stack (DB, Backend, Frontend) runs with one command.
- **Audit Logging**: Tracks critical actions for compliance.
- **Responsive UI**: Modern React frontend with Bootstrap.

## 🛠 Technology Stack

- **Frontend**: React 19, Bootstrap 5, Axios.
- **Backend**: Node.js 22, Express 5.
- **Database**: PostgreSQL 15.
- **DevOps**: Docker & Docker Compose.

## 🏗 Architecture

The system uses a shared-database, shared-schema architecture where every table has a `tenant_id` column. Middleware strictly enforces this isolation on every request.

![Architecture Diagram](./docs/images/system-architecture.png)

## 📦 Installation & Setup

### Prerequisites
- Docker & Docker Compose installed.

### ⚡ Quick Start (Docker)

This is the recommended way to run the application.

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd multi-tenant-saas
    ```

2.  **Start the services:**
    ```bash
    docker-compose up -d
    ```
    *Note: This starts Postgres, Backend (Port 5000), and Frontend (Port 3000).*

3.  **Wait for Initialization:**
    The backend automatically runs database migrations and seeds initial data. You can verify it's ready by checking the health endpoint:
    ```bash
    curl http://localhost:5000/api/health
    # Should return {"status":"ok", "database":"connected"}
    ```

4.  **Access the Application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🔑 Test Credentials

The system is pre-seeded with the following accounts (from `submission.json`):

**1. Super Admin (System Wide)**
- Email: `superadmin@system.com`
- Password: `Admin@123`

**2. Tenant Admin (Demo Company)**
- Email: `admin@demo.com`
- Password: `Demo@123`
- Subdomain: `demo`

**3. Regular User (Demo Company)**
- Email: `user1@demo.com`
- Password: `User@123`
- Subdomain: `demo`

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture & ERD](./docs/architecture.md)
- [Research Document](./docs/research.md)
- [Product Requirements (PRD)](./docs/PRD.md)

## 🧪 Testing

To run the evaluation validation manually:
1. Ensure services are running.
2. Use the credentials in `submission.json` to verify login flows.
3. Test RBAC by trying to access Admin routes as a regular User.

## 📝 Environment Variables

The project uses the following environment variables (already configured in `docker-compose.yml` for dev):

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: Database credentials.
- `JWT_SECRET`: Secret for signing tokens.
- `FRONTEND_URL`: URL for CORS whitelisting.
