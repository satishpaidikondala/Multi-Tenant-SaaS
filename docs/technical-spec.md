# Technical Specification

## 1. Project Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── config/         # Environment & DB config
│   ├── controllers/    # Request handlers (Auth, User, Project, etc.)
│   ├── middleware/     # Auth, RBAC, Error handling
│   ├── models/         # Database models (Sequelize/Prisma definitions)
│   ├── routes/         # API Route definitions
│   ├── services/       # Business logic (Audit logging, etc.)
│   ├── utils/          # Helper functions (Validators, etc.)
│   └── app.js          # Express app entry point
├── migrations/         # SQL migration files
├── seeds/              # SQL seed files
├── tests/              # Unit & Integration tests
├── Dockerfile
├── package.json
└── .env.example
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/     # Reusable UI components (Button, Modal, Card)
│   ├── contexts/       # React Context (AuthContext)
│   ├── layouts/        # Layout wrappers (DashboardLayout)
│   ├── pages/          # Page components (Login, Dashboard, Projects)
│   ├── services/       # API client (axios setup)
│   ├── hooks/          # Custom hooks
│   └── main.jsx        # Entry point
├── public/
├── Dockerfile
├── package.json
└── vite.config.js
```

## 2. Development Setup Guide

### Prerequisites
- Docker & Docker Compose
- Node.js v18+ (for local dev without Docker)

### Installation
1.  Clone the repository.
2.  Copy `.env.example` to `.env` in `backend/`.
    ```bash
    cp backend/.env.example backend/.env
    ```

### Running with Docker (Recommended)
The entire stack can be brought up with a single command:
```bash
docker-compose up -d
```
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: Port 5432 exposed.

### Running Locally (Manual)
1.  **Database**: `docker-compose up -d database`
2.  **Backend**:
    ```bash
    cd backend
    npm install
    npm run migrate  # Run DB migrations
    npm run seed     # Seed DB
    npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Testing
Run backend tests:
```bash
docker-compose exec backend npm test
```
