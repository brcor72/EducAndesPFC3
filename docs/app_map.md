# EducAndes Platform App Map

This document outlines the user flows, page routes, and view functionalities of the EducAndes platform.

---

## 1. User Roles & Access Hierarchy

```
                      ┌──────────────────────┐
                      │   Visitor (Guest)    │
                      └──────────┬───────────┘
                                 │ Can register / login
                                 ▼
                      ┌──────────────────────┐
                      │  Student (Auth-JWT)  │
                      └──────────┬───────────┘
                                 │ Admin role assigned
                                 ▼
                      ┌──────────────────────┐
                      │    Administrator     │
                      └──────────────────────┘
```

---

## 2. Visitor Views (Guest Flow)

These routes are public and do not require authentication:

### 🏠 Home Page (`/`)
* **Features**:
  - Multilingual Language Selector (Spanish, Quechua, Aymara, Shipibo-Konibo).
  - Platform benefits summary.
  - Featured course cards list.
  - Speech Synthesis button (TTS) to read home text out loud.
  - Quick Onboarding tutorial trigger.

### 📚 Course Catalog (`/cursos`)
* **Features**:
  - Filter courses by category (`CAMPO`, `NEGOCIO`, `TECNOLOGIA`, `ENERGIA`).
  - Search bar.
  - Course cards displaying duration, difficulty tier, and enrollment status.

### 📖 Course Details (`/curso/:slug`)
* **Features**:
  - Course description and outline list of lessons.
  - Clicking on a lesson or trying to access the forums prompts the Login dialog if not authenticated.

### 💬 Static Help Chatbot (Floating Widget)
* **Features**:
  - Floating bubble widget on the bottom right.
  - Suggests 5 common questions (Registration, Cost, Audio, etc.).
  - Fallback keyword parser returning predefined translation answers.

---

## 3. Student Views (Authenticated Flow)

These routes require authentication using **DNI** and password (handled by a `JwtAuthGuard` backend and Zustant auth store in the frontend):

### 🎯 Dashboard / My Goals (`/metas`)
* **Features**:
  - Cards tracking daily study targets.
  - Active courses progress bars.
  - Days remaining and completed lessons counters.

### 👤 Profile Settings (`/perfil`)
* **Features**:
  - Edit display name, community, and default language.
  - Update password.

### 📖 Course Lesson & Quiz View (`/curso/:slug/leccion/:index`)
* **Features**:
  - Multilingual lesson title and detail content.
  - Inline Text-To-Speech (TTS) synthesizer with Peruvian-accented pronunciation.
  - **End-of-Lesson Quiz**: Multi-choice forms checking answers in real-time.
  - **[NEW] AI Interactive Practice Panel**:
    - Opens when a lesson has `isPractice === true`.
    - Slides out from the side or splits the screen.
    - Initiates conversation with the **Generic AI Practice Engine** regarding the lesson's scenario.

### 💬 Discussion Forums (`/foros/:courseId`)
* **Features**:
  - Thread list filtered by course.
  - Add thread, reply to threads, and delete own messages.
  - Multilingual thread support.

---

## 4. Admin Views (Admin Dashboard Flow)

Protected by `AdminRoute` check (checks `role.name === 'admin'`).

### 📊 Admin Dashboard (`/admin`)
* **Features**:
  - KPI summaries (Total active users, forum interaction rates, course completion percentages).
  - ENGAGEMENT charts (via Recharts).

### 👥 User Management (`/admin/usuarios`)
* **Features**:
  - Search and filter users by DNI, role, or community.
  - Create user accounts or edit active status.

### 📝 Course & Lesson CRUD (`/admin/cursos`)
* **Features**:
  - Create courses (Slug, Title, Categories).
  - Lesson Manager: Add/reorder/remove lessons, quizzes, and practice scenarios.
  - Toggle publishing state (`isPublished`).
