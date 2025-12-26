# Multi-Tenant SaaS Platform

## 📖 Project Overview

A production-ready, multi-tenant SaaS application built with **React, Node.js, and PostgreSQL**. This platform allows organizations (tenants) to register, manage their teams, create projects, and track tasks with complete **data isolation**. It implements **Role-Based Access Control (RBAC)** and subscription limits, all containerized with **Docker** for one-command deployment.

**Target Audience:** Organizations needing a private workspace for project management.

---

## ✨ Key Features

- **Multi-Tenancy Architecture:** Complete data isolation using `tenant_id` at the database level.
- **Secure Authentication:** JWT-based stateless authentication with 24-hour expiry.
- **Role-Based Access Control (RBAC):** Three distinct roles (Super Admin, Tenant Admin, User).
- **Subscription Management:** Enforces limits on Users and Projects based on plans (Free, Pro, Enterprise).
- **Project & Task Management:** Create projects, assign tasks, and track status (Todo, In Progress, Completed).
- **Organization Management:** Tenant Admins can manage their users; Super Admins can manage tenants.
- **Audit Logging:** Critical actions are logged for security and compliance.
- **Dockerized Deployment:** Fully containerized Frontend, Backend, and Database.

---

## 🛠️ Technology Stack

### **Frontend**

- **React:** v18.x
- **React Router Dom:** v6.x (Navigation)
- **Bootstrap / React-Bootstrap:** (UI Styling)
- **Axios:** (API Communication)

### **Backend**

- **Node.js:** v18.x
- **Express.js:** v4.x
- **PostgreSQL:** v15 (Database)
- **node-postgres (pg):** (DB Client)
- **Bcrypt:** (Password Hashing)
- **JSON Web Token (JWT):** (Auth)

### **Infrastructure**

- **Docker & Docker Compose:** Containerization and Orchestration.

---

## 🏗️ Architecture Overview

The application follows a **3-Tier Architecture**:

1.  **Frontend (Client):** React SPA running on Port `3000`.
2.  **Backend (API):** Express REST API running on Port `5000`.
3.  **Database (Data):** PostgreSQL running on Port `5432`.

**Multi-Tenancy Strategy:** Shared Database, Shared Schema. Isolation is enforced via a mandatory `tenant_id` column on all data tables (Users, Projects, Tasks).

---

## 🚀 Installation & Setup

### **Prerequisites**

- Docker Desktop (installed and running)
- Git

### **Step-by-Step Setup**

1.  **Clone the Repository**

    ```bash
    git clone <repository-url>
    cd Multi-Tenant-SaaS
    ```

2.  **Start the Application**
    Run the following command to build and start all services (Database, Backend, Frontend):

    ```bash
    docker-compose up -d --build
    ```

3.  **Verify Status**
    Check if all containers are running:

    ```bash
    docker-compose ps
    ```

4.  **Access the App**

    - **Frontend:** [http://localhost:3000](http://localhost:3000)
    - **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

5.  **Automatic Seeding**
    The database initializes automatically with a **Super Admin**, a **Demo Tenant**, and **Sample Data**.
    - **Admin Login:** `admin@demo.com` / `Demo@123`
    - **Super Admin:** `superadmin@system.com` / `Admin@123`

---

## 🔑 Environment Variables

These variables are configured in `docker-compose.yml`.

| Variable            | Description                                   |
| :------------------ | :-------------------------------------------- |
| `POSTGRES_DB`       | Database name (default: `saas_db`)            |
| `POSTGRES_USER`     | Database user (default: `postgres`)           |
| `POSTGRES_PASSWORD` | Database password                             |
| `JWT_SECRET`        | Secret key for signing tokens                 |
| `FRONTEND_URL`      | URL for CORS policy (`http://localhost:3000`) |

---

## 📚 API Documentation

For full API details, please refer to [docs/API.md](./docs/API.md).

**Main Endpoints:**

- `POST /api/auth/login` - User Login
- `POST /api/auth/register-tenant` - Register New Organization
- `GET /api/projects` - List Projects
- `GET /api/projects/:id/tasks` - List Tasks for a Project
