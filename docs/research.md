# Research Document: Multi-Tenancy Architecture & Technology Stack

## 1. Multi-Tenancy Analysis

Multi-tenancy is a software architecture where a single instance of software runs on a server and serves multiple tenants. A tenant is a group of users who share a common access with specific privileges to the software instance. In our case, each "organization" is a tenant.

### Approaches to Multi-Tenancy

There are three primary approaches to implementing multi-tenancy in a relational database environment:

#### A. Shared Database, Shared Schema (Discriminator Column)
In this approach, all tenants share the same database and tables. Every table includes a `tenant_id` column to associate records with a specific tenant. Queries must always include a `WHERE tenant_id = ?` clause.

**Pros:**
- **Lowest Cost:** Only one database instance is required.
- **Easy Maintenance:** Schema updates happen once for everyone.
- **Resource Efficiency:** Connection pooling is efficient as there's only one DB source.

**Cons:**
- **Data Isolation Risk:** A missed `WHERE` clause can expose one tenant's data to another.
- **Backup/Restore Complexity:** Restoring a single tenant's data is difficult.
- **Noisy Neighbor:** One heavy tenant can degrade performance for all others.

#### B. Shared Database, Separate Schemas
Here, multiple schemas (namespaces) exist within a single database. Each tenant gets their own schema (e.g., `tenant_a.users`, `tenant_b.users`).

**Pros:**
- **Better Isolation:** Data is logically separated at the schema level.
- **Customization:** Easier to support per-tenant schema extensions if needed (though rare in SaaS).
- **Security:** Database users can be restricted to specific schemas.

**Cons:**
- **Complexity:** Running migrations requires iterating through all schemas.
- **Overhead:** Database metadata grows with the number of tenants, potentially hitting limits.

#### C. Separate Databases (Database-per-Tenant)
Each tenant has their own completely separate database instance or catalog.

**Pros:**
- **Highest Isolation:** Physical separation of data.
- **Performance:** Easy to scale individual tenants to different servers.
- **Disaster Recovery:** Easy to backup/restore a specific tenant.

**Cons:**
- **Highest Cost:** More resources, more management overhead.
- **Maintenance Nightmare:** Maintaining thousands of database connections and running migrations across thousands of DBs is complex.

### Chosen Approach: Shared Database, Shared Schema
For this project, we have selected the **Shared Database, Shared Schema** approach.

**Justification:**
1.  **Complexity vs. Requirements:** The project requirements specify a manageable scale where physical isolation is overkill. The "Discriminator Column" approach is the industry standard for most early-to-mid-stage SaaS platforms due to its simplicity in development and deployment.
2.  **Tooling Support:** Modern ORMs and Postgres make it highly performant to index on `tenant_id`.
3.  **Cost:** It requires the least infrastructure resource, which aligns with our requirement for a simple Dockerized setup.
4.  **Agility:** Schema changes are instant for all tenants, allowing for rapid iteration which is crucial for this project's scope.

### Comparison Table

| Feature | Shared Schema | Separate Schema | Separate Database |
| :--- | :--- | :--- | :--- |
| **Isolation** | Low (Application level) | Medium (Logical level) | High (Physical level) |
| **Cost** | Low | Low-Medium | High |
| **Complexity** | Low | Medium | High |
| **Scalability** | High (until DB limit) | Medium (Schema overhead) | High (Horizontal scaling) |
| **DevOps** | Simple | Moderate | Complex |

---

## 2. Technology Stack Justification

### Backend: Node.js with Express
- **Why:** Node.js is non-blocking and event-driven, making it ideal for I/O-heavy applications like a CRUD SaaS. Express is the standard framework, offering stability, a massive ecosystem of middleware (crucial for Auth/CORS/Logging), and flexibility.
- **Alternatives:** Python (Django/Flask) was considered. Django is "batteries-included" but can be rigid. Flask is too minimal. Node.js offers the perfect balance of performance and developer speed for this task.

### Frontend: React (Vite) + Tailwind CSS
- **Why React:** It is the industry standard for building dynamic SPAs. Its component-based architecture is perfect for a dashboard-heavy SaaS. Vite provides instant dev server start and optimized builds.
- **Why Tailwind:** Requirement for "Rich Aesthetics" and "Premium Design". Tailwind allows for rapid styling without fighting CSS specificity issues, and its utility-first class naming speeds up development significantly.
- **Alternatives:** Vue.js (great, but React has a larger ecosystem for SaaS components), Angular (too verbose).

### Database: PostgreSQL
- **Why:** PostgreSQL is the most advanced open-source relational database. It facilitates strict data integrity (Foreign Keys, CASCADE deletes) which is non-negotiable for multi-tenancy. Its support for JSONB also offers flexibility if we need semi-structured data later.
- **Alternatives:** MongoDB (NoSQL). Rejected because relational integrity (Accounts -> Users -> Projects -> Tasks) is core to this domain.

### Authentication: JWT (JSON Web Tokens)
- **Why:** Stateless authentication scales better than sessions. It enables us to embed the `tenant_id` and `role` directly into the token, allowing simple middleware to enforce multi-tenancy without a DB lookup on every single permission check (though we still check DB for data).
- **Expiry:** 24-hour expiry balances security and user convenience.

### Containerization: Docker & Docker Compose
- **Why:** Mandatory requirement. It ensures "it works on my machine" translates to production. It isolates the services and makes deployment a single command (`docker-compose up -d`).

---

## 3. Security Considerations for Multi-Tenancy

### 1. Tenant Isolation
The most critical security risk is data leakage between tenants.
- **Strategy:** Every single database query must include `WHERE tenant_id = ?`.
- **Implementation:** We will implement a `tenantMiddleware` that extracts the `tenant_id` from the JWT and attaches it to the request object. 

### 2. Authentication & Authorization (RBAC)
- **JWT Security:** Tokens will be signed with a strong secret. We will not store sensitive data (PII) in the token payload, only IDs and Roles.
- **Role Hierarchy:**
    - `Super Admin`: System-wide access.
    - `Tenant Admin`: Admin access within their tenant scope.
    - `User`: Limited access within their tenant scope.
- **Middleware:** A specific `rbacMiddleware` will guard endpoints like `DELETE /users`, verifying not just the authentication, but the specific role required.

### 3. Password Security
- **Hashing:** We will use `bcrypt` (or `argon2`) to hash passwords. Plain text passwords will never be stored.
- **Policy:** Passwords must meet minimum length requirements.

### 4. API Security
- **Input Validation:** All incoming data (body, params) will be validated to prevent SQL injection and XSS.
- **Rate Limiting:** (Optional but recommended) to prevent abuse.
- **CORS:** Strictly configured to allow only the frontend domain.

### 5. Audit Logging
- **Requirement:** Track who did what.
- **Implementation:** An `audit_logs` table will record critical actions (User Created, Project Deleted), linking them to the `tenant_id` and `user_id`. This provides accountability and is often a compliance requirement for B2B SaaS.

---

## 4. Conclusion
This architecture balances the need for speed of development with the rigorous requirements of data isolation and security. The Shared Database pattern minimizes infrastructure overhead while Node.js and React provide a modern, performant, and responsive user experience.
