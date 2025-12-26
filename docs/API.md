# API Documentation

Base URL: `http://localhost:5000/api`

## 1. Authentication Module

### **Register Tenant**

- **Endpoint:** `POST /auth/register-tenant`
- **Description:** Register a new organization and admin user.
- **Body:**
  ```json
  {
    "tenantName": "Tesla Inc",
    "subdomain": "tesla",
    "adminEmail": "elon@tesla.com",
    "adminPassword": "password123",
    "adminFullName": "Elon Musk"
  }
  ```
- **Response (201):**
  ```json
  { "success": true, "message": "Tenant registered successfully" }
  ```

### **Login**

- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate user and receive JWT.
- **Body:**
  ```json
  {
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo" // Optional if email is unique
  }
  ```
- **Response (200):**
  ```json
  { "success": true, "data": { "token": "jwt...", "user": { ... } } }
  ```

### **Get Current User**

- **Endpoint:** `GET /auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** Returns user and tenant details.

---

## 2. Tenant Management

### **Get Tenant Details**

- **Endpoint:** `GET /tenants/:tenantId`
- **Auth:** Required (Tenant Admin or Super Admin)
- **Response:** Returns tenant info and stats (user count, project count).

### **List All Tenants**

- **Endpoint:** `GET /tenants`
- **Auth:** Required (Super Admin ONLY)
- **Response:** List of all registered tenants.

---

## 3. User Management

### **Add User to Tenant**

- **Endpoint:** `POST /tenants/:tenantId/users`
- **Auth:** Required (Tenant Admin)
- **Body:**
  ```json
  {
    "email": "employee@demo.com",
    "password": "User@123",
    "fullName": "John Doe",
    "role": "user"
  }
  ```

### **List Tenant Users**

- **Endpoint:** `GET /tenants/:tenantId/users`
- **Auth:** Required
- **Response:** List of users belonging to the tenant.

### **Delete User**

- **Endpoint:** `DELETE /users/:userId`
- **Auth:** Required (Tenant Admin)

---

## 4. Project Management

### **Create Project**

- **Endpoint:** `POST /projects`
- **Auth:** Required
- **Body:**
  ```json
  {
    "name": "New Website",
    "description": "Redesign project",
    "status": "active"
  }
  ```

### **List Projects**

- **Endpoint:** `GET /projects`
- **Auth:** Required
- **Response:** Returns all projects for the current user's tenant.

---

## 5. Task Management

### **Create Task**

- **Endpoint:** `POST /projects/:projectId/tasks`
- **Auth:** Required
- **Body:**
  ```json
  {
    "title": "Design Homepage",
    "priority": "high"
  }
  ```

### **List Project Tasks**

- **Endpoint:** `GET /projects/:projectId/tasks`
- **Auth:** Required
- **Response:** Returns all tasks for the specified project.

### **Update Task Status**

- **Endpoint:** `PATCH /tasks/:taskId/status`
- **Auth:** Required
- **Body:** `{ "status": "completed" }`
