# Product Requirements Document (PRD): Multi-Tenant SaaS Platform

## 1. User Personas

### 1.1 Super Admin
- **Role Description:** System-level administrator with global access permissions.
- **Key Responsibilities:**
  - Manage all tenants (organizations).
  - Configure subscription plans and limits.
  - Monitor system-wide health and usage.
- **Main Goals:** Ensure the platform is running smoothly, manage billing/subscriptions, and troubleshoot tenant-level issues.
- **Pain Points:** Lack of visibility into tenant usage, difficulty in troubleshooting across isolated data.

### 1.2 Tenant Admin
- **Role Description:** Administrator for a specific organization (tenant).
- **Key Responsibilities:**
  - Manage team members (add/remove users).
  - Oversee all projects and tasks within the organization.
  - Manage billing and subscription details for their organization.
- **Main Goals:** Efficiently manage team workflow, ensure projects are on track, and control access.
- **Pain Points:** managing user permissions, tracking overall project status.

### 1.3 User (Team Member)
- **Role Description:** Regular employee or member of a tenant organization.
- **Key Responsibilities:**
  - Execute tasks assigned to them.
  - specific Update task status.
  - Collaborate on projects.
- **Main Goals:** Complete assigned work, track deadlines, and communicate progress.
- **Pain Points:** Clarity on priorities, overwhelmed by irrelevant information (needs focused view).

---

## 2. Functional Requirements

### Authentication & Authorization
- **FR-001:** The system shall allow users to register a new tenant organization with a unique subdomain.
- **FR-002:** The system shall authenticate users via email and password using JWT with a 24-hour expiry.
- **FR-003:** The system shall verify the tenant subdomain matches the user's registered tenant during login.
- **FR-004:** The system shall restrict "Super Admin" routes to users with the `super_admin` role.
- **FR-005:** The system shall restrict "Tenant Admin" routes (e.g., Add User) to users with `tenant_admin` role.

### Multi-Tenancy & Data Isolation
- **FR-006:** The system shall strictly isolate all data (projects, tasks, users) by `tenant_id`.
- **FR-007:** The system shall prevent a user from accessing any resource belonging to a different tenant, returning a 403 Forbidden error.
- **FR-008:** The system shall allow the Super Admin to view resources across all tenants for support purposes.

### Subscription Management
- **FR-009:** The system shall enforce `max_users` limits based on the tenant's subscription plan (Free: 5, Pro: 25, Enterprise: 100).
- **FR-010:** The system shall enforce `max_projects` limits based on the tenant's subscription plan.
- **FR-011:** The system shall default new tenants to the 'Free' plan upon registration.

### Project & Task Management
- **FR-012:** The system shall allow users to create new projects with a name, description, and status.
- **FR-013:** The system shall allow users to create tasks within a project, assigning them to other users in the same tenant.
- **FR-014:** The system shall allow users to update task status (Todo, In Progress, Completed) and priority.
- **FR-015:** The system shall allow Tenant Admins to delete projects and users, cascading the deletion or handling dependencies appropriately.

### Audit & Security
- **FR-016:** The system shall log significant actions (Create User, Delete Project) to an `audit_logs` table with the actor's ID and timestamp.

---

## 3. Non-Functional Requirements

### Performance
- **NFR-001:** API response time should be under 200ms for 90% of standard read requests.
- **NFR-002:** The database shall be indexed on `tenant_id` to ensure query performance does not degrade as the number of tenants increases.

### Security
- **NFR-003:** All user passwords must be hashed using a strong algorithm (e.g., bcrypt) before storage.
- **NFR-004:** The system must enforce HTTPS for all communications in production (handled via reverse proxy/load balancer in real world, simplified here).

### Scalability
- **NFR-005:** The application must be stateless (session data in JWT) to allow for horizontal scaling of backend containers.

### Usability
- **NFR-006:** The frontend application must be responsive and usable on mobile devices (width < 768px).

### Availability
- **NFR-007:** The system should target 99% uptime during business hours.
