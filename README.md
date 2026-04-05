# Finance Dashboard Backend

This repository contains the backend system for a robust Finance Dashboard, designed to demonstrate solid API architecture, efficient data modeling, precise Role-Based Access Control (RBAC), and rigorous testing standards.

It was developed strictly adhering to industry-standard backend design principles, suitable for production-level evaluation.

## 🚀 Live Demo & Documentation
- **Live Base URL**: *[https://zorvyn-assessment-egwk.onrender.com]*
- **API Documentation (Swagger)**: *[https://zorvyn-assessment-egwk.onrender.com]*/api-docs
  - All APIs are rigorously documented. You can execute requests visually via the Swagger UI.

---

## 🛠️ Tech Stack & Architecture
- **Node.js + Express**: Scalable and lightweight HTTP layer.
- **TypeScript**: End-to-end type safety, eliminating entire classes of runtime errors.
- **Prisma & SQLite**: Declarative ORM for clean and predictable data modeling. SQLite is used out-of-the-box for portability and immediate setup without requiring external dependencies or Docker.
- **Zod**: Robust, schema-based input validation ensuring bad payloads are safely rejected before hitting the database.
- **Jest + Supertest**: End-to-end integration and unit testing framework.
- **JWT (JSON Web Tokens)**: Stateless authentication.

---

## 🧠 Business Logic & Features

### 1. Robust User & Role Management
- **Automatic Admin Seeding**: To prevent lockouts and ensure system stability, the application automatically seeds a permanent `ADMIN` user upon initialization.
  - **Email**: `admin@admin.com`
  - **Password**: `admin123`
- **Strict Role-Based Access Control (RBAC)**:
  - **Viewer**: Read-only access to high-level, aggregated dashboard summaries.
  - **Analyst**: Can access aggregated summaries *and* view granular, individual line-item records.
  - **Admin**: Full permissions (manage users, create/update/delete records).
- **Security Safeguards**:
  - Newly registered users are strictly defaulted to the `VIEWER` role.
  - Escalation prevention: No user can be promoted to `ADMIN` dynamically via API.
  - Admins cannot be dangerously deactivated/locked out by other Admins.

### 2. Financial Records & Analytics APIs
- **Full CRUD for Records**: Support for Income, Expense, categorizations, timestamps, and notes.
- **Advanced Pagination**: The `GET /records` endpoint supports both offset-based (`page`, `limit`) and cursor-based (`cursor`) pagination mechanisms for high-performance data retrieval at scale.
- **Dashboard Summary Aggregation**: The system calculates live totals, net balances, category distributions, and recent activity, hiding granular details from Viewers.
- **Robust Validation**: `Zod` securely blocks invalid dates or malformed payloads gracefully returning `400 Bad Request` instead of internal `500` server crashes.

---

## ⚙️ Setup & Deployment Guide

### Local Setup
1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Environment Configuration**
   By default, the `.env` should look like this:
   ```env
   PORT=3000
   JWT_SECRET=supersecret123
   DATABASE_URL="file:./dev.db"
   ```
3. **Database Initialization**
   Initialize the SQLite database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Running the Application**
   ```bash
   npm run dev
   ```

### Deploying to Render
This project is configured out-of-the-box to be deployed securely onto [Render](https://render.com).
1. Connect your GitHub repository to Render as a **Web Service**.
2. **Build Command**: `npm run build` *(The package.json automatically handles TypeScript compilation and Prisma deployment (`npx prisma generate && npx prisma migrate deploy && tsc`))*
3. **Start Command**: `npm run start`
4. Add your `.env` variables into Render's Environment settings.

*(Note: SQLite acts as an ephemeral filesystem if not using a Render Disk. For persistent deployment, simply change the `DATABASE_URL` string to a PostgreSQL connection).*

---

## 🧪 Testing Suite
The application includes a comprehensive Jest testing suite that validates Auth, Endpoints, Validation Rules, and Security Middlewares automatically.

Run tests:
```bash
npm run test
```

---

## 📝 Design Decisions & Trade-offs
1. **SQLite over PostgreSQL**: Chosen intentionally for maximum evaluator convenience to prevent complex local Docker setups. The system is structurally decoupled so migrating to Postgres is heavily simplified (just 1 line change in `.env`).
2. **Input Validation Strategy**: Avoided creating a custom global exception catcher, instead allowing Zod parsing logic inside controllers directly to promote localized context and cleaner stack tracing.
3. **Cursor Pagination Integration**: Implemented cursor logic internally demonstrating a forward-looking approach for scaling infinite-scroll frontend implementations.
