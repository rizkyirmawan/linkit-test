# ☕ Coffee Shop Mini Application

A full-stack mini application that fetches coffee data from [Sample APIs](https://sampleapis.com/api-list/coffee), stores it in a local database, and provides a complete CRUD dashboard with authentication.

---

## Tech Stack

| Layer                 | Technology                                                |
| --------------------- | --------------------------------------------------------- |
| **Backend Runtime**   | [Bun](https://bun.sh) 1.3                                 |
| **Backend Framework** | [Elysia](https://elysiajs.com) 1.4                        |
| **Database**          | MySQL 8.0                                                 |
| **ORM**               | [Drizzle ORM](https://orm.drizzle.team) 0.38              |
| **Auth**              | JWT (`@elysiajs/jwt`) + bcrypt                            |
| **Frontend**          | [Vue 3](https://vuejs.org) + [Vite 6](https://vitejs.dev) |
| **Styling**           | [Tailwind CSS](https://tailwindcss.com) 3.4               |
| **State Management**  | [Pinia](https://pinia.vuejs.org)                          |
| **Containerization**  | Docker + Docker Compose                                   |

---

## Project Structure

```
linkit-test/
├── backend/                          # Bun + Elysia + Drizzle ORM
│   ├── src/
│   │   ├── index.ts                  # Entry point - Elysia app bootstrap
│   │   ├── db/
│   │   │   ├── schema.ts             # 4 Drizzle table definitions
│   │   │   ├── index.ts              # DB connection pool
│   │   │   └── migrate.ts           # Schema migration runner
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT verification guard
│   │   │   ├── logger.ts            # Request logging middleware
│   │   │   ├── monitor.ts           # Alert simulation (errors >3, slow >2s)
│   │   │   └── errorHandler.ts      # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.ts              # Register & Login
│   │   │   ├── coffees.ts           # Coffee CRUD
│   │   │   ├── orders.ts            # Order CRUD (with FK relations)
│   │   │   ├── sync.ts              # External API sync trigger
│   │   │   ├── logs.ts              # Transaction log viewer
│   │   │   └── health.ts            # Health check endpoint
│   │   └── services/
│   │       └── syncService.ts       # Fetch from sampleapis.com/coffee
│   ├── drizzle.config.ts
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
├── frontend/                         # Vue 3 + Vite + Tailwind
│   ├── src/
│   │   ├── main.ts                  # Vue app entry
│   │   ├── App.vue                  # Root component
│   │   ├── router/index.ts          # Vue Router with auth guard
│   │   ├── stores/
│   │   │   ├── auth.ts             # Auth state (Pinia)
│   │   │   ├── coffee.ts           # Coffee state
│   │   │   └── order.ts            # Order state
│   │   ├── views/
│   │   │   ├── LoginPage.vue       # Login/Register page
│   │   │   └── DashboardPage.vue   # Main admin dashboard
│   │   ├── components/
│   │   │   ├── NavBar.vue          # Top navigation with logout
│   │   │   ├── CoffeeTable.vue     # Coffee list with CRUD actions
│   │   │   ├── CoffeeModal.vue     # Add/Edit coffee form
│   │   │   ├── OrderTable.vue      # Order list with inline status
│   │   │   ├── OrderModal.vue      # New order form
│   │   │   └── LogViewer.vue       # Request/error log table
│   │   └── services/api.ts         # Axios instance with JWT interceptor
│   ├── index.html
│   ├── vite.config.ts              # Dev proxy /api → localhost:3000
│   ├── tailwind.config.js
│   └── package.json
├── Dockerfile                         # Multi-stage Bun build
├── docker-compose.yml                 # MySQL + Backend + Frontend
├── start-dev.bat                      # Dev startup script
└── README.md
```

---

## Database Schema

### 4 Tables

#### `users` — Authentication

| Column     | Type                  | Notes            |
| ---------- | --------------------- | ---------------- |
| id         | INT PK AUTO_INCREMENT |                  |
| username   | VARCHAR(100) UNIQUE   | Login credential |
| password   | VARCHAR(255)          | bcrypt hashed    |
| created_at | TIMESTAMP             |                  |

#### `coffees` — **Master Table** (external API data)

| Column                  | Type                  | Notes                       |
| ----------------------- | --------------------- | --------------------------- |
| id                      | INT PK AUTO_INCREMENT |                             |
| external_id             | INT                   | Original ID from Sample API |
| title                   | VARCHAR(255)          | Coffee name                 |
| description             | TEXT                  |                             |
| ingredients             | TEXT                  | JSON array stored as string |
| image                   | VARCHAR(500)          | Image URL                   |
| type                    | VARCHAR(10)           | `hot` or `iced`             |
| created_at / updated_at | TIMESTAMP             |                             |

#### `orders` — **Transactional Table**

| Column                  | Type                  | Notes                               |
| ----------------------- | --------------------- | ----------------------------------- |
| id                      | INT PK AUTO_INCREMENT |                                     |
| coffee_id               | INT FK → coffees.id   |                                     |
| user_id                 | INT FK → users.id     |                                     |
| quantity                | INT                   | Min 1                               |
| total_price             | DECIMAL(10,2)         |                                     |
| status                  | VARCHAR(20)           | `pending`, `completed`, `cancelled` |
| ordered_at / updated_at | TIMESTAMP             |                                     |

#### `logs` — Audit Trail

| Column        | Type                  | Notes                        |
| ------------- | --------------------- | ---------------------------- |
| id            | INT PK AUTO_INCREMENT |                              |
| method        | VARCHAR(10)           | HTTP method                  |
| endpoint      | VARCHAR(255)          | Request path                 |
| status_code   | INT                   | HTTP response code           |
| response_time | DECIMAL(10,2)         | Milliseconds                 |
| level         | VARCHAR(10)           | `info`, `error`, `warn`      |
| message       | TEXT                  | Log details + alert messages |
| timestamp     | TIMESTAMP             |                              |

**Relations**: orders → coffees (M:1), orders → users (M:1)

---

## API Endpoints

All endpoints return JSON. Protected routes require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint             | Auth | Description                                              |
| ------ | -------------------- | ---- | -------------------------------------------------------- |
| POST   | `/api/auth/register` | No   | Register new user (username 3+ chars, password 6+ chars) |
| POST   | `/api/auth/login`    | No   | Login, returns JWT token                                 |

### Coffee CRUD (Master)

| Method | Endpoint           | Auth | Description                           |
| ------ | ------------------ | ---- | ------------------------------------- |
| GET    | `/api/coffees`     | ✓    | List all coffees (sorted by title)    |
| GET    | `/api/coffees/:id` | ✓    | Get single coffee                     |
| POST   | `/api/coffees`     | ✓    | Create coffee (title + type required) |
| PUT    | `/api/coffees/:id` | ✓    | Update coffee (partial update)        |
| DELETE | `/api/coffees/:id` | ✓    | Delete coffee                         |

### Order CRUD (Transactional)

| Method | Endpoint          | Auth | Description                                |
| ------ | ----------------- | ---- | ------------------------------------------ |
| GET    | `/api/orders`     | ✓    | List orders (with coffee + user relations) |
| GET    | `/api/orders/:id` | ✓    | Get single order                           |
| POST   | `/api/orders`     | ✓    | Create order (validates FK + bounds)       |
| PUT    | `/api/orders/:id` | ✓    | Update order status/qty/price              |
| DELETE | `/api/orders/:id` | ✓    | Delete order                               |

### System

| Method | Endpoint    | Auth | Description                                        |
| ------ | ----------- | ---- | -------------------------------------------------- |
| POST   | `/api/sync` | ✓    | Re-fetch from sampleapis.com (upserts coffee data) |
| GET    | `/api/logs` | ✓    | View last 100 request logs                         |
| GET    | `/health`   | No   | Health check (DB status + uptime)                  |

### Response Status Codes

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| 200  | Success                                   |
| 201  | Created                                   |
| 400  | Validation error (missing/invalid fields) |
| 401  | Unauthorized (missing/invalid token)      |
| 404  | Resource not found                        |
| 409  | Conflict (duplicate username)             |
| 500  | Internal server error                     |

---

## Prerequisites

- [Bun](https://bun.sh) 1.3+ (`npm install -g bun` or `powershell -c "irm bun.sh/install.ps1 | iex"`)
- [Node.js](https://nodejs.org) 18+ (for frontend build tools)
- MySQL 8.0 running locally

---

## Quick Start (Development)

### 1. Database Setup

```bash
# Create database (if not exists)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS linkit_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migration
cd backend
bun run src/db/migrate.ts
```

### 2. Backend

```bash
cd backend
bun install
bun run src/index.ts
# Server starts at http://localhost:3000
# Health:   http://localhost:3000/health
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Dev server at http://localhost:5173
# Proxies /api → localhost:3000
```

### 4. Windows Quick Start

Double-click `start-dev.bat` — starts both backend and frontend in separate terminals.

### 5. Initial Data Sync

```bash
# Login (or register first)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use the returned token to sync data from Sample APIs
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer <token>"
```

---

## Docker Deployment

```bash
docker-compose up --build
```

This starts 3 services:
| Service | Port | Description |
|---------|------|-------------|
| mysql | 3307 | MySQL 8 (host port mapped to avoid conflict) |
| backend | 3000 | Bun/Elysia API server |
| frontend | 5173 | Nginx serving built Vue app |

---

## Logging & Monitoring

### Request Logging

Every API request is automatically logged to the `logs` table with:

- HTTP method & endpoint
- Response status code
- Response time (ms)
- Error messages

### View Logs

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/logs
```

### Alert Simulation (in-memory)

| Alert               | Threshold              | Behavior                |
| ------------------- | ---------------------- | ----------------------- |
| **High error rate** | >3 errors in 5 minutes | Logs `warn` level alert |
| **Slow response**   | Response time >2000ms  | Logs `warn` level alert |

Alerts have a 60-second cooldown to prevent spam.

---

## Features Checklist

| Requirement                                       | Status |
| ------------------------------------------------- | ------ |
| Authentication (JWT Bearer Token)                 | ✅     |
| Protected routes w/ auth guard                    | ✅     |
| Master table (coffees)                            | ✅     |
| Transactional table (orders)                      | ✅     |
| External API data sync                            | ✅     |
| GET / POST / PUT / DELETE endpoints               | ✅     |
| JSON responses with proper status codes           | ✅     |
| Error handling and validation                     | ✅     |
| Frontend dashboard with data display              | ✅     |
| Login page                                        | ✅     |
| Form/modal for transaction input                  | ✅     |
| Request logging (method, endpoint, status, time)  | ✅     |
| Error logs                                        | ✅     |
| `/health` endpoint                                | ✅     |
| Alert simulation (high error rate, slow response) | ✅     |
| Dockerfile                                        | ✅     |
| Docker Compose                                    | ✅     |

---

## Default Credentials

| Username   | Password     | Notes                     |
| ---------- | ------------ | ------------------------- |
| `admin`    | `admin123`   | Auto-created on first run |
| `testuser` | `test123456` | Created in tests          |

---

## Environment Variables

| Variable      | Default                          | Description         |
| ------------- | -------------------------------- | ------------------- |
| `DB_HOST`     | `localhost`                      | MySQL host          |
| `DB_USER`     | `root`                           | MySQL user          |
| `DB_PASSWORD` | _(empty)_                        | MySQL password      |
| `DB_NAME`     | `linkit_test`                    | Database name       |
| `DB_PORT`     | `3306`                           | MySQL port          |
| `JWT_SECRET`  | `coffee-app-jwt-secret-key-2024` | JWT signing secret  |
| `PORT`        | `3000`                           | Backend server port |
