# ☀️ EducAndes / Allin Yachay 🏔️
> **EducAndes** (also known as *Allin Yachay* - *"Good Knowledge"* in Quechua) is an inclusive, multilingual learning management platform (LMS) designed specifically for rural and indigenous communities in the Andean and Amazonian regions of Peru. It aims to bridge the digital and educational divide by offering free, practical courses in native languages.

---

## 📋 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [App Map & User Flows](#-app-map--user-flows)
5. [Directory Structure](#-directory-structure)
6. [Local Environment Setup](#-local-environment-setup)
   - [Option A: Quick Start with Docker Compose](#option-a-quick-start-with-docker-compose)
   - [Option B: Manual Setup for Development](#option-b-manual-setup-for-development)
7. [Database Schema & Seed Data](#-database-schema--seed-data)
8. [Production Deployment](#-production-deployment)
9. [Running End-to-End Tests](#-running-end-to-end-tests)

---


## 🌟 Overview
Traditional educational platforms are often inaccessible to rural agricultural populations due to language barriers, literacy levels, and a lack of local context. **EducAndes** solves these challenges by providing:
* **Indigenous Language Support:** The entire platform interface and course contents are translated and localized in four languages:
  * 🇪🇸 **Español** (Spanish)
  * 🇵🇪 **Runasimi** (Quechua)
  * 🇵🇪 **Aymar aru** (Aymara)
  * 🇵🇪 **Shipibo-Konibo** (Shipibo)
* **Accessibility-First Design:** A persistent Text-to-Speech (TTS) engine reads lessons and questions out loud in local Andean Spanish pronunciation (`es-PE`) at a tailored reading speed.
* **Culturally Contextual Content:** Courses focus on practical, local skills like guinea pig and poultry breeding (*crianza de cuyes y gallinas*), smart livestock management (*ganadería inteligente*), pricing strategies for farmers (*precios justos*), automatic irrigation sensors (*riego automático*), community rotating savings funds (*juntas y panderos*), and digital security (avoiding online scams on Yape/SMS).

---

## 🚀 Key Features
* **Interactive Scenarios:** Case studies (*casos prácticos*) that ask users to solve community problems (e.g. managing a sick animal, detecting a scam, calculating crop margins).
* **Gamified Quizzes:** Visual multi-option quizzes at the end of each lesson to validate and save academic progress.
* **Onboarding & Tutorial:** An interactive walkthrough introducing first-time internet users to the platform's buttons, audio functions, and page layouts.
* **Community Forums:** A thread-and-reply discussion system tailored for each course where learners and instructors exchange advice.
* **Help Chatbot:** A local assistant (*Preguntaca Yachay*) answering common questions about registration, audio support, and platform operations.
* **Admin Dashboard:** Administrative controls to view analytical charts (active users, course completion rates, forum engagement) and manage courses, lessons, and users.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React 18, Vite, TypeScript
* **State Management:** Zustand (manages Auth state, i18n/Language state, and Tutorial state)
* **Data Fetching:** TanStack React Query v5 & Axios (with automated access/refresh token rotation interceptors)
* **Styling:** Tailwind CSS, Radix UI primitives (unstyled accessible primitives), Lucide React (icons)
* **Charts/Analytics:** Recharts
* **Notifications:** Sonner (toast alerts)

### Backend
* **Core:** NestJS 10 (TypeScript-based Node.js framework)
* **Database ORM:** Prisma Client 5.10
* **API Documentation:** Swagger UI (accessible at `/api/docs`)
* **Security:** Helmet, Compression, Express Rate Limit, NestJS Throttler
* **Authentication:** Passport.js (JWT Access Token / Refresh Token strategy, Local strategy)
* **Validation:** Class-validator, Class-transformer

### Database
* **Database Engine:** PostgreSQL 16

### Containerization & Deployment
* **Docker & Docker Compose** (standardizes development and local multi-container environments)
* **Nginx** (serves built React bundle and reverse-proxies API calls in container environments)
* **Vercel** (pre-configured for Frontend hosting)
* **Railway / Render** (pre-configured for Backend + Database hosting)

---

## 🗺️ App Map & User Flows

### 1. Unauthenticated Visitor (Guest)
```
[HomePage /] ──► [Select Language] ──► [Onboarding Tutorial]
      │
      ├──► [View Course Catalog /cursos] ──► [Course Details /curso/:slug]
      │                                                │
      └──► [Chatbot / Help Support]                    ▼
                                           (Redirect to Auth for Metas/Forums)
```
* **HomePage (`/`):** View featured courses, program benefits, testimonials, and trigger the speech synthesizer.
* **Course Catalog (`/cursos`):** Search, filter courses by category (*Campo*, *Negocio*, *Tecnología*, *Energía*).
* **Course Detail (`/curso/:slug`):** View lessons structure. Clicking on private features (like quizzes, progress-tracking, forums) prompts authentication.

### 2. Authenticated Student
```
[Register/Login with DNI] ──► [Access Saved Progress]
             │
             ├──► [Mis Metas /metas] ──► Track daily targets & days left
             ├──► [Lesson View] ──► Study with audio ──► Take Quiz ──► Mark Done
             └──► [Forums /foros] ──► Create Thread ──► Reply to community
```
* **Authentication:** Users register/login using their **DNI** (Peruvian national ID card - 8 digits) and a password, ensuring a simple login method for individuals without email accounts.
* **Interactive Lessons:** Study course materials, listen to audio narratives, solve practical cases, and submit quizzes.
* **Mis Metas (`/metas`):** Personalized panel tracking started courses, lessons completed, daily study goals, and estimated finish dates.
* **Discussion Forums (`/foros/:courseId`):** Engage with other students of the same course.

### 3. Platform Administrator
```
[Admin Account] ──► [Admin Panel /admin]
                           │
                           ├──► [Dashboard] ──► Read Recharts statistics & KPIs
                           ├──► [Usuarios]  ──► Active status toggle & role management
                           └──► [Cursos]    ──► Create, update, publish, or sort courses
```
* **Admin Dashboard (`/admin`):** Analytical overview of platform metrics.
* **User Management (`/admin/usuarios`):** Create admin/student accounts, assign permissions, or suspend users.
* **Course Management (`/admin/cursos`):** Admin CRUD operations to construct courses, append lessons, populate quizzes, and toggle publish states.

---

## 📁 Directory Structure
```
EducAndesPFC3/
├── backend/                       # NestJS API Backend
│   ├── prisma/                    # DB configuration
│   │   ├── schema.prisma          # PostgreSQL Prisma Database Schema
│   │   └── seed.ts                # Large seed script with full multilingual course contents
│   ├── src/
│   │   ├── common/                # Exception filters, guards, interceptors, pipes
│   │   ├── modules/               # Functional modules
│   │   │   ├── audit/             # System activity tracking
│   │   │   ├── auth/              # JWT auth and DNI login flow
│   │   │   ├── courses/           # Course metadata & publishing
│   │   │   ├── dashboard/         # Stats queries for administrators
│   │   │   ├── forums/            # Discussion threads & replies
│   │   │   ├── lessons/           # Lesson pages, scenarios, and quizzes
│   │   │   ├── notifications/     # Notifications & system alerts
│   │   │   ├── progress/          # Student course progression tracking
│   │   │   ├── roles/             # RBAC roles and permissions mapping
│   │   │   └── users/             # User profiles, DNI and language preferences
│   │   ├── app.module.ts          # Main module connecting configuration and modules
│   │   └── main.ts                # Application bootstrapping script (cors, security, swagger)
│   ├── Dockerfile                 # Slim multi-stage production Docker image
│   └── package.json               # Backend dependencies and run scripts
│
├── frontend/                      # React Vite Frontend SPA
│   ├── public/                    # Video covers, community icons, static media assets
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   │   ├── audio/             # SpeakButton (Text-To-Speech SpeechSynthesis engine)
│   │   │   ├── chatbot/           # Interactive customer support chatbot
│   │   │   ├── layout/            # SiteHeader & AndeanBorder (geometric indigenous pattern layout)
│   │   │   └── tutorial/          # Interactive onboarding user guide
│   │   ├── hooks/                 # Custom React hooks (e.g. useSpeech)
│   │   ├── pages/                 # Route components (HomePage, MetasPage, ProfilePage, Admin views)
│   │   ├── services/              # Axios API clients & React Query handlers
│   │   ├── store/                 # Zustand stores (auth.store, i18n.store, tutorial.store)
│   │   ├── App.tsx                # Main router with PrivateRoute and AdminRoute protections
│   │   └── main.tsx               # Client entrypoint mounting React
│   ├── Dockerfile                 # Multi-stage Docker image serving via Nginx
│   └── package.json               # Frontend packages
│
├── source/                        # Legacy/Reference repository files (Supabase/Bun)
├── docker-compose.yml             # Local orchestrator for Postgres, Backend, and Frontend
├── DESPLIEGUE.md                  # Detailed step-by-step production cloud deployment guide
└── .env.example                   # Master environmental configuration example
```

---

## 💻 Local Environment Setup

### Option A: Quick Start with Docker Compose
Ensure you have [Docker](https://www.docker.com/) installed on your machine.

1. **Clone and Enter the Workspace:**
   ```bash
   cd EducAndesPFC3
   ```

2. **Configure Environment Variables:**
   Copy the root `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Spin up the containers:**
   ```bash
   docker compose up --build -d
   ```
   This command starts:
   * **PostgreSQL:** Running on port `5432` (named `educandes-postgres`).
   * **Backend API:** Bootstrapping NestJS on port `3001` (runs migrations automatically on start).
   * **Frontend Web:** Exposing the React app on port `80` (served through Nginx).

4. **Seed the database (Required to load courses & admin user):**
   Execute the seeding script directly in the backend container:
   ```bash
   docker exec -it educandes-backend npm run prisma:seed
   ```

5. **Access the application:**
   * **Website (Frontend):** [http://localhost](http://localhost)
   * **Backend API Documentation:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

### Option B: Manual Setup for Development

#### Prerequisites
* Node.js v20.x
* PostgreSQL running locally (port 5432)

#### 1. Setup Database & Backend
1. **Navigate to backend and copy configuration:**
   ```bash
   cd backend
   cp .env.example .env
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure the PostgreSQL Connection:**
   Ensure the `DATABASE_URL` in `backend/.env` points to your active database.
4. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```
5. **Load Seed Data (Courses, Lessons, Quizzes, Roles, and Admin):**
   ```bash
   npm run prisma:seed
   ```
6. **Start the API Development Server:**
   ```bash
   npm run start:dev
   ```
   The backend will run at [http://localhost:3001](http://localhost:3001). You can inspect the API endpoints in Swagger at `/api/docs`.

#### 2. Setup Frontend
1. **Open a new terminal, navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install packages:**
   ```bash
   npm install
   ```
3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend will be served at [http://localhost:5173](http://localhost:5173).

---

## 🗄️ Database Schema & Seed Data
The database handles comprehensive data modeling. Highlights of `schema.prisma` include:
* **User:** Tracks credentials, preferred interface language (`es`, `qu`, `ay`, `shp`), Peruvian DNI, and home community name.
* **Role / Permission / RolePermission:** Flexible role-based routing (e.g. `admin`, `student`).
* **Course & Lesson:** Custom fields for multilingual titles and translations (e.g., `titleQu` for Quechua, `titleAy` for Aymara).
* **QuizQuestion & QuizSubmission:** Captures multi-choice options and checks user answers.
* **AuditLog:** Audits modifications and writes records of actions, IP addresses, and user-agent details for compliance.

### Default Admin Credentials (from Seed)
Upon seeding the database, an administrator account is created:
* **DNI:** `00000000`
* **Password:** `admin123` (or the seeded value specified in `prisma/seed.ts`)

---

## ☁️ Production Deployment
For details on how to deploy this project in a cloud ecosystem:
* **Frontend:** Hosted on **Vercel**
* **Backend + Database:** Hosted on **Railway** (uses `railway.toml`)

Refer to [DESPLIEGUE.md](file:///Users/lechuga/Projects/EducAndesPFC3/DESPLIEGUE.md) for step-by-step instructions.

---

## 🧪 Running End-to-End Tests

We use **Playwright** to run end-to-end tests to verify authentication, course navigation, and the interactive AI Practice Engine (Yachaq).

### Prerequisites
Before running tests, ensure you have set up the local development environment manually (Option B) and seeded the database to ensure the mock accounts exist.

### Step 1: Install Dependencies & Playwright Browsers
Navigate to the `frontend` folder, install the package dependencies (which installs `@playwright/test`), and install the required browser engines:
```bash
cd frontend
npm install
npx playwright install
```

### Step 2: Run the Tests
To run the automated E2E tests in headless mode (make sure you are inside the `frontend` directory):
```bash
cd frontend
npm run test:e2e
```

### Step 3: Run in Interactive UI Mode
To inspect tests visually, view trace steps, or debug dialogue flows with the AI agent:
```bash
cd frontend
npx playwright test --ui
```


