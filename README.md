# Hospital Management System

A full-stack, production-grade Hospital Management System built with **Node.js / Express / MongoDB** on the backend and **React (Vite)** on the frontend. Built as a Weeks 7–8 backend development internship capstone project.

---

## Table of Contents

1. [Core Features](#core-features)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [MongoDB Schema Design](#mongodb-schema-design)
5. [ER Diagram (Text)](#er-diagram-text)
6. [API Endpoints](#api-endpoints)
7. [Sample Request / Response](#sample-request--response)
8. [Setup Guide](#setup-guide)
9. [Docker Instructions](#docker-instructions)
10. [Testing Instructions](#testing-instructions)
11. [Deployment Guide (Railway / Render)](#deployment-guide-railway--render)

---

## Core Features

| Feature | Description |
|---|---|
| **Authentication & Authorization** | JWT-based signup/login, role-based access control (Admin, Doctor, Receptionist) |
| **Doctors Management** | Create/update/delete doctors, specialization, availability, contact info |
| **Patients Management** | Register patients, store age, gender, medical history |
| **Appointment Scheduling** | Book appointments, **prevent double-booking** (overlap detection per doctor), status lifecycle: `pending → confirmed → completed` (or `cancelled`) |
| **Billing System** | Generate bills with itemized treatments/charges, auto-computed totals, payment status (`paid`/`unpaid`) |
| **Reports** | Daily/weekly summary: total patients, appointments by status, revenue collected/pending |
| **Notifications** | Simulated, log-based appointment alerts (created/confirmed/completed/cancelled), retrievable via API |
| **Role Management** | Admin = full control; Doctor = view patients & own appointments; Receptionist = manage bookings/billing |

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, express-validator, Helmet, express-rate-limit, Swagger (swagger-jsdoc + swagger-ui-express), Jest + Supertest + mongodb-memory-server

**Frontend:** React 18, Vite, React Router v6, Axios, plain CSS (hospital-themed)

**DevOps:** Docker, Docker Compose, GitHub Actions CI/CD

---

## Folder Structure

```
hospital-management-system/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── swagger.js            # Swagger/OpenAPI spec generation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── billController.js
│   │   ├── reportController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect + authorize(role...)
│   │   ├── errorMiddleware.js    # centralized error handler
│   │   └── validateMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   └── Bill.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── billRoutes.js
│   │   ├── reportRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   └── notificationService.js
│   ├── validators/               # express-validator rule sets
│   ├── utils/
│   │   └── generateToken.js
│   ├── tests/
│   │   ├── setup.js
│   │   ├── unit/
│   │   │   ├── user.model.test.js
│   │   │   ├── generateToken.test.js
│   │   │   ├── notificationService.test.js
│   │   │   └── authMiddleware.test.js
│   │   └── integration/
│   │       ├── auth.test.js
│   │       ├── doctor.test.js
│   │       ├── patient.test.js
│   │       ├── appointment.test.js
│   │       ├── bill.test.js
│   │       └── report.test.js
│   ├── app.js                    # Express app (exported for tests)
│   ├── server.js                 # Entry point (connects DB + listens)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── jest.config.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios instance + one module per resource
│   │   ├── components/           # Navbar, Sidebar, Layout, Modal, StatusBadge, Loader...
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx / Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── Patients.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Billing.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── NotFound.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── package.json
│
├── .github/workflows/ci.yml      # CI/CD pipeline
├── docker-compose.yml            # mongo + backend + frontend
└── README.md
```

---

## MongoDB Schema Design

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | required, hashed (bcrypt), `select: false` |
| role | String | enum: `admin`, `doctor`, `receptionist` |
| doctorProfile | ObjectId → Doctor | set when role is `doctor` |
| isActive | Boolean | default `true` |

### Doctor
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| specialization | String | required, indexed |
| email | String | required, unique |
| phone | String | required |
| availability | [{ day, startTime, endTime }] | weekly schedule |
| consultationFee | Number | default 0 |
| isActive | Boolean | default `true` |
| linkedUser | ObjectId → User | optional link to login account |

### Patient
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| age | Number | required, 0–150 |
| gender | String | enum: `male`, `female`, `other` |
| phone | String | required |
| email | String | optional |
| address | String | optional |
| medicalHistory | [{ condition, diagnosedOn, notes }] | array of records |
| bloodGroup | String | optional |
| registeredBy | ObjectId → User | audit trail |

### Appointment
| Field | Type | Notes |
|---|---|---|
| patient | ObjectId → Patient | required |
| doctor | ObjectId → Doctor | required |
| date | Date | required |
| startTime / endTime | String (`HH:MM`) | required |
| status | String | enum: `pending`, `confirmed`, `completed`, `cancelled` |
| reason | String | optional |
| createdBy | ObjectId → User | audit trail |

> **Double-booking prevention:** a partial unique compound index on `(doctor, date, startTime)` for `status in [pending, confirmed]`, **plus** an explicit overlap check in `appointmentController.createAppointment` / `updateAppointment` that rejects any new/updated appointment whose time range intersects an existing pending/confirmed appointment for the same doctor on the same day (HTTP `409 Conflict`).

### Bill
| Field | Type | Notes |
|---|---|---|
| patient | ObjectId → Patient | required |
| appointment | ObjectId → Appointment | optional |
| treatments | [{ name, charge }] | itemized list |
| totalAmount | Number | auto-computed from treatments on save |
| paymentStatus | String | enum: `paid`, `unpaid` |
| paymentMethod | String | enum: `cash`, `card`, `insurance`, `online` |
| generatedBy | ObjectId → User | audit trail |

---



## API Endpoints

Base URL: `http://localhost:5000/api` — Full interactive docs at **`/api-docs`** (Swagger UI).

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register a new user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Private | Get current user profile |

### Doctors
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/doctors` | Private | List doctors (`?specialization=`) |
| POST | `/doctors` | Admin | Create doctor |
| GET | `/doctors/:id` | Private | Get doctor by ID |
| PUT | `/doctors/:id` | Admin | Update doctor |
| DELETE | `/doctors/:id` | Admin | Delete doctor |

### Patients
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/patients` | Private | List patients (`?search=`) |
| POST | `/patients` | Admin, Receptionist | Register patient |
| GET | `/patients/:id` | Private | Get patient by ID |
| PUT | `/patients/:id` | Admin, Receptionist | Update patient |
| DELETE | `/patients/:id` | Admin | Delete patient |

### Appointments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/appointments` | Private | List (`?doctor=&patient=&status=&date=`); doctors see only their own |
| POST | `/appointments` | Admin, Receptionist | Book appointment (409 on conflict) |
| GET | `/appointments/:id` | Private | Get appointment by ID |
| PUT | `/appointments/:id` | Admin, Receptionist | Reschedule/update |
| PATCH | `/appointments/:id/status` | Admin, Receptionist, Doctor | Update status |
| DELETE | `/appointments/:id` | Admin, Receptionist | Cancel/delete |

### Billing
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/bills` | Private | List bills (`?patient=&paymentStatus=`) |
| POST | `/bills` | Admin, Receptionist | Generate bill |
| GET | `/bills/:id` | Private | Get bill by ID |
| PATCH | `/bills/:id/payment` | Admin, Receptionist | Update payment status |
| DELETE | `/bills/:id` | Admin | Delete bill |

### Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/reports/summary` | Admin, Doctor, Receptionist | `?period=daily\|weekly` — patients, appointments, revenue |

### Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Private | Recent simulated appointment alerts (`?limit=`) |

All private routes require header: `Authorization: Bearer <JWT>`

---

## Sample Request / Response

### Signup
**POST** `/api/auth/signup`
```json
{
  "name": "Jane Admin",
  "email": "jane@hospital.com",
  "password": "secret123",
  "role": "admin"
}
```
**201 Response**
```json
{
  "success": true,
  "data": {
    "user": { "id": "665f...", "name": "Jane Admin", "email": "jane@hospital.com", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Book Appointment
**POST** `/api/appointments`
```json
{
  "patient": "665f1a2b3c4d5e6f7a8b9c0d",
  "doctor": "665f1a2b3c4d5e6f7a8b9c0e",
  "date": "2026-09-01",
  "startTime": "10:00",
  "endTime": "10:30",
  "reason": "Routine checkup"
}
```
**409 Response (double-booking)**
```json
{
  "success": false,
  "message": "This doctor already has an appointment that overlaps with the requested time slot"
}
```

### Generate Bill
**POST** `/api/bills`
```json
{
  "patient": "665f1a2b3c4d5e6f7a8b9c0d",
  "treatments": [
    { "name": "Consultation", "charge": 50 },
    { "name": "Blood Test", "charge": 30 }
  ],
  "paymentMethod": "cash"
}
```
**201 Response**
```json
{
  "success": true,
  "data": {
    "_id": "665f...",
    "patient": "665f1a2b3c4d5e6f7a8b9c0d",
    "treatments": [{ "name": "Consultation", "charge": 50 }, { "name": "Blood Test", "charge": 30 }],
    "totalAmount": 80,
    "paymentStatus": "unpaid",
    "paymentMethod": "cash"
  }
}
```

### Reports Summary
**GET** `/api/reports/summary?period=daily`
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "totalPatients": 128,
    "newPatients": 4,
    "totalAppointments": 12,
    "appointmentsByStatus": { "pending": 3, "confirmed": 5, "completed": 4 },
    "revenueCollected": 620,
    "revenuePending": 150
  }
}
```

---

## Setup Guide

### Prerequisites
- Node.js ≥ 18
- MongoDB (local instance or Atlas connection string)
- npm

### 1. Clone & install
```bash
cd hospital-management-system

# Backend
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, etc.

# Frontend (in a new terminal)
cd ../frontend
npm install
cp .env.example .env
# edit .env: set VITE_API_BASE_URL if backend isn't on localhost:5000
```

### 2. Run MongoDB
Either run MongoDB locally (`mongod`) or use a free MongoDB Atlas cluster and paste its connection string into `backend/.env` as `MONGO_URI`.

### 3. Start the backend
```bash
cd backend
npm run dev        # nodemon, auto-restarts on changes
# or: npm start
```
Backend runs at `http://localhost:5000`. Swagger docs at `http://localhost:5000/api-docs`.

### 4. Start the frontend
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:5173`.

### 5. Create your first user
Sign up via the UI (`/signup`) or via API, choosing role `admin` first so you can create doctors and manage everything.

---

## Docker Instructions

The project ships with a `docker-compose.yml` at the repo root that runs MongoDB, the backend, and the frontend (served via Nginx) together.

```bash
# From the project root
cp backend/.env.example backend/.env   # optional, compose sets its own env vars
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Swagger docs: `http://localhost:5000/api-docs`
- MongoDB: `mongodb://localhost:27017/hospital_management`

To set a custom JWT secret:
```bash
JWT_SECRET=your_long_random_secret docker compose up --build
```

Stop everything:
```bash
docker compose down          # keep data
docker compose down -v       # also remove the mongo volume (wipes data)
```

### Building images individually
```bash
docker build -t hms-backend ./backend
docker build -t hms-frontend ./frontend
```

---

## Testing Instructions

Backend tests use **Jest + Supertest + mongodb-memory-server** (an in-memory MongoDB instance, no external DB needed).

```bash
cd backend
npm install
npm test
```

This runs:
- **Unit tests** (`tests/unit/`):
  - `user.model.test.js` — password hashing, `comparePassword`, `toSafeObject`.
  - `generateToken.test.js` — JWT payload contents and secret verification.
  - `notificationService.test.js` — notification creation and recent-notifications ordering/limit.
  - `authMiddleware.test.js` — `authorize()` role-based access control (allowed role, forbidden role, missing user).
- **Integration tests** (`tests/integration/`) — full HTTP request/response cycles against the Express app:
  - `auth.test.js`: signup, duplicate-email rejection, login (valid/invalid), `/me` auth guard.
  - `doctor.test.js`: admin-only create/update/delete, role forbidding, validation errors, filtering.
  - `patient.test.js`: registration by receptionist, RBAC enforcement, validation, search.
  - `appointment.test.js`: successful booking, **double-booking rejection (409)**, and valid back-to-back (non-overlapping) bookings.
  - `bill.test.js`: bill generation with auto-computed totals, payment status updates, admin-only deletion.
  - `report.test.js`: daily/weekly summary report contents and access control.
  - `report.test.js` (Notifications API block): notification retrieval after an appointment event.

> Note: the first test run downloads a MongoDB binary for `mongodb-memory-server` (requires outbound internet access once; cached afterward). This is handled automatically in the GitHub Actions CI pipeline.

Watch mode while developing:
```bash
npm run test:watch
```

---

## Deployment Guide (Railway / Render)

### Backend (Render — Web Service)
1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo, set **Root Directory** to `backend`.
3. Build command: `npm install`  |  Start command: `npm start`
4. Add environment variables: `MONGO_URI` (Atlas connection string), `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your deployed frontend URL), `NODE_ENV=production`.
5. Deploy. Render gives you a public URL like `https://hms-backend.onrender.com`.

### Backend (Railway)
1. **New Project → Deploy from GitHub repo**, set root directory to `backend`.
2. Railway auto-detects Node; set the same environment variables as above under **Variables**.
3. Optionally add a MongoDB plugin from Railway's marketplace, or use MongoDB Atlas and paste the URI into `MONGO_URI`.
4. Deploy; Railway assigns a public domain.

### Frontend (Render — Static Site, or Railway)
1. **New → Static Site**, root directory `frontend`.
2. Build command: `npm install && npm run build`  |  Publish directory: `dist`
3. Environment variable: `VITE_API_BASE_URL=https://<your-backend-url>/api`
4. Deploy.

### Database (MongoDB Atlas — recommended for both)
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access from anywhere (`0.0.0.0/0`) for simplicity, or restrict to your hosting provider's IPs.
3. Copy the connection string into `MONGO_URI` on your backend deployment.

### Post-deploy checklist
- [ ] `CLIENT_URL` on backend matches the deployed frontend origin (for CORS).
- [ ] `VITE_API_BASE_URL` on frontend points to the deployed backend `/api`.
- [ ] `JWT_SECRET` is a long random string, different from `.env.example`.
- [ ] Visit `/api-docs` on the deployed backend to confirm Swagger loads.
- [ ] Sign up an `admin` user first, then create doctors, then test the double-booking behavior.

---

## Notes on Notifications

Notifications are intentionally **simulated/log-based** per the assignment requirements — every appointment lifecycle change is written to server logs and stored in-memory, retrievable via `GET /api/notifications`. In a real deployment this module is the integration point for a provider like Twilio (SMS) or SendGrid (email); the service is isolated in `services/notificationService.js` so swapping in a real provider only requires changing that one file.

<!-- Local development setup -->
