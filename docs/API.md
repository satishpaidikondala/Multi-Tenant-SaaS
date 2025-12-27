# API Documentation

Base URL: `http://localhost:5000/api`

## 1. Authentication Module

### **1. Register Tenant**
- **Endpoint:** `POST /auth/register-tenant`
- **Auth:** None
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
  { "success": true, "message": "Tenant registered successfully", "data": { ... } }
  ```

### **2. User Login**
- **Endpoint:** `POST /auth/login`
- **Auth:** None
- **Body:**
  ```json
  {
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }
  ```
- **Response (200):**
  ```json
  { "success": true, "data": { "token": "jwt...", "user": { ... } } }
  ```

### **3. Get Current User**
- **Endpoint:** `GET /auth/me`
- **Auth:** Bearer Token
- **Response (200):** Returns user and tenant details.

### **4. Logout**
- **Endpoint:** `POST /auth/logout`
- **Auth:** Bearer Token
- **Response (200):** `{ "success": true, "message": "Logged out successfully" }`

---

## 2. Tenant Management

### **5. Get Tenant Details**
- **Endpoint:** `GET /tenants/:tenantId`
- **Auth:** Tenant Admin or Super Admin
- **Response (200):** Returns tenant info and stats.

### **6. Update Tenant**
- **Endpoint:** `PUT /tenants/:tenantId`
- **Auth:** Tenant Admin (name only) / Super Admin (all)
- **Body:** `{ "name": "New Name", "maxUsers": 50 }`
- **Response (200):** Returns updated tenant.

### **7. List All Tenants**
- **Endpoint:** `GET /tenants`
- **Auth:** Super Admin ONLY
- **Params:** `?page=1&limit=10&status=active`
- **Response (200):** `{ "success": true, "data": { "tenants": [], "pagination": {} } }`

---

## 3. User Management

### **8. Add User to Tenant**
- **Endpoint:** `POST /tenants/:tenantId/users`
- **Auth:** Tenant Admin
- **Body:**
  ```json
  { "email": "new@demo.com", "password": "pass", "fullName": "John", "role": "user" }
  ```
- **Response (201):** Returns created user.

### **9. List Tenant Users**
- **Endpoint:** `GET /tenants/:tenantId/users`
- **Auth:** Tenant Member
- **Params:** `?search=john&role=user`
- **Response (200):** Returns list of users.

### **10. Update User**
- **Endpoint:** `PUT /users/:userId`
- **Auth:** Tenant Admin
- **Body:** `{ "fullName": "John Updated", "role": "tenant_admin", "isActive": true }`
- **Response (200):** Returns updated user.

### **11. Delete User**
- **Endpoint:** `DELETE /users/:userId`
- **Auth:** Tenant Admin
- **Response (200):** `{ "success": true, "message": "User deleted successfully" }`

---

## 4. Project Management

### **12. Create Project**
- **Endpoint:** `POST /projects`
- **Auth:** Tenant Member
- **Body:** `{ "name": "New Project", "description": "Desc" }`
- **Response (201):** Returns created project.

### **13. List Projects**
- **Endpoint:** `GET /projects`
- **Auth:** Tenant Member
- **Params:** `?status=active&search=website`
- **Response (200):** Returns list of projects.

### **14. Update Project**
- **Endpoint:** `PUT /projects/:projectId`
- **Auth:** Tenant Admin or Creator
- **Body:** `{ "name": "Updated", "status": "archived" }`
- **Response (200):** Returns updated project.

### **15. Delete Project**
- **Endpoint:** `DELETE /projects/:projectId`
- **Auth:** Tenant Admin or Creator
- **Response (200):** `{ "success": true, "message": "Project deleted successfully" }`

---

## 5. Task Management

### **16. Create Task**
- **Endpoint:** `POST /projects/:projectId/tasks`
- **Auth:** Tenant Member
- **Body:**
  ```json
  { "title": "Fix Bug", "assignedTo": "uuid", "priority": "high", "dueDate": "2024-12-31" }
  ```
- **Response (201):** Returns created task.

### **17. List Project Tasks**
- **Endpoint:** `GET /projects/:projectId/tasks`
- **Auth:** Tenant Member
- **Params:** `?status=todo&priority=high`
- **Response (200):** Returns list of tasks.

### **18. Update Task Status**
- **Endpoint:** `PATCH /tasks/:taskId/status`
- **Auth:** Tenant Member
- **Body:** `{ "status": "completed" }`
- **Response (200):** Returns updated task.

### **19. Update Task**
- **Endpoint:** `PUT /tasks/:taskId`
- **Auth:** Tenant Member
- **Body:** `{ "title": "New Title", "priority": "low" }`
- **Response (200):** Returns updated task.
