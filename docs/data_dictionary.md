# EducAndes Database Data Dictionary

This document serves as the data dictionary for the EducAndes PostgreSQL database managed via Prisma ORM.

---

## Table of Contents
1. [User (users)](#1-user-users)
2. [Role (roles)](#2-role-roles)
3. [Permission (permissions)](#3-permission-permissions)
4. [RolePermission (role_permissions)](#4-rolepermission-role_permissions)
5. [RefreshToken (refresh_tokens)](#5-refreshtoken-refresh_tokens)
6. [Course (courses)](#6-course-courses)
7. [Lesson (lessons)](#7-lesson-lessons)
8. [QuizQuestion (quiz_questions)](#8-quizquestion-quiz_questions)
9. [QuizSubmission (quiz_submissions)](#9-quizsubmission-quiz_submissions)
10. [CourseProgress (course_progress)](#10-courseprogress-course_progress)
11. [ForumThread (forum_threads)](#11-forumthread-forum_threads)
12. [ForumReply (forum_replies)](#12-forumreply-forum_replies)
13. [Notification (notifications)](#13-notification-notifications)
14. [AuditLog (audit_logs)](#14-auditlog-audit_logs)
15. [Setting (settings)](#15-setting-settings)

---

## 1. User (users)
Tracks student and administrator credentials, community origin, and preferred language.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier for the user. |
| `dni` | VarChar(8) | Unique, Index | Peruvian National ID card (8 digits). Used as main login key. |
| `email` | VarChar(255) | Unique, Nullable | Email address (optional for students, common for admins). |
| `displayName` | VarChar(100) | Not Null | User's full name. |
| `community` | VarChar(100) | Nullable | Name of the rural community where the user resides. |
| `preferredLang`| Enum (`Lang`) | Default: `es` | Preferred interface language (`es`, `qu`, `ay`, `shp`). |
| `passwordHash` | String | Not Null | BCrypt hashed password. |
| `avatarUrl` | VarChar(500) | Nullable | URL to user's profile picture. |
| `roleId` | UUID | Foreign Key | References `Role.id`. |
| `isActive` | Boolean | Default: `true` | Flags if the account is active or suspended. |
| `deletedAt` | DateTime | Nullable | Timestamp for soft deletion. |
| `createdAt` | DateTime | Default: `now()` | Date of registration. |
| `updatedAt` | DateTime | Auto-update | Last profile update timestamp. |

---

## 2. Role (roles)
Defines access levels within the application (e.g., `admin`, `student`).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier for the role. |
| `name` | VarChar(50) | Unique | Name of the role (e.g., "admin", "student"). |
| `description` | String | Nullable | Description of permissions associated with the role. |
| `createdAt` | DateTime | Default: `now()` | Creation timestamp. |
| `updatedAt` | DateTime | Auto-update | Last update timestamp. |

---

## 3. Permission (permissions)
Finer-grained controls mapping resource actions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier for the permission. |
| `resource` | VarChar(50) | Unique Compound | Resource name (e.g., "courses", "users"). |
| `action` | VarChar(20) | Unique Compound | Action permitted (e.g., "create", "read", "update", "delete"). |
| `description` | String | Nullable | Explanation of what action is allowed. |
| `createdAt` | DateTime | Default: `now()` | Creation timestamp. |

---

## 4. RolePermission (role_permissions)
Many-to-many relationship mapping roles to specific permissions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `roleId` | UUID | PK, FK | References `Role.id`. Cascades on delete. |
| `permissionId` | UUID | PK, FK | References `Permission.id`. Cascades on delete. |

---

## 5. RefreshToken (refresh_tokens)
Handles OAuth/JWT session rotation.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique session key identifier. |
| `token` | String | Unique, Index | Rotated refresh token string. |
| `userId` | UUID | Foreign Key | References `User.id`. Cascades on delete. |
| `expiresAt` | DateTime | Not Null | Expiration date of the refresh token. |
| `revoked` | Boolean | Default: `false` | True if the token was logged out or rotated. |
| `ipAddress` | VarChar(45) | Nullable | Client IP address. |
| `userAgent` | VarChar(500) | Nullable | Client browser user-agent. |
| `createdAt` | DateTime | Default: `now()` | Date the session started. |

---

## 6. Course (courses)
Multilingual courses offered on the platform.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier for the course. |
| `slug` | VarChar(100) | Unique | URL slug (e.g. "cuyes"). |
| `title` | VarChar(200) | Not Null | Course title in Spanish. |
| `titleQu` | VarChar(200) | Nullable | Course title in Quechua. |
| `titleAy` | VarChar(200) | Nullable | Course title in Aymara. |
| `short` | VarChar(300) | Not Null | Short Spanish description. |
| `shortQu` | VarChar(300) | Nullable | Short Quechua description. |
| `long` | Text | Not Null | Long course overview. |
| `imageUrl` | VarChar(500) | Nullable | Cover image path. |
| `iconName` | VarChar(50) | Nullable | Lucide icon name representation. |
| `level` | Enum (`CourseLevel`)| Default: `INICIAL` | Difficulty tier (`INICIAL`, `INTERMEDIO`, `AVANZADO`). |
| `durationWeeks`| Int | Default: `4` | Target study duration in weeks. |
| `category` | Enum (`Category`)| Not Null | Category classification (`CAMPO`, `NEGOCIO`, `TECNOLOGIA`, `ENERGIA`). |
| `isPublished` | Boolean | Default: `false` | Published status toggle. |
| `sortOrder` | Int | Default: `0` | Order of catalog layout rendering. |
| `deletedAt` | DateTime | Nullable | Soft-delete timestamp. |
| `createdAt` | DateTime | Default: `now()` | Creation date. |
| `updatedAt` | DateTime | Auto-update | Last update date. |

---

## 7. Lesson (lessons)
Specific study modules in a course. Can house interactive practices.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique lesson identifier. |
| `courseId` | UUID | Foreign Key | References `Course.id`. Cascades on delete. |
| `index` | Int | Unique Compound | Order of the lesson within the course. |
| `title` | VarChar(200) | Not Null | Lesson title. |
| `summary` | VarChar(400) | Not Null | Brief summary of the class. |
| `detail` | Text | Not Null | Main educational contents (read aloud by TTS). |
| `isPractice` | Boolean | Default: `false` | If true, this lesson ends with an interactive case. |
| `practiceTitle` | VarChar(200) | Nullable | Title of the practical case. |
| `practiceScenario`| Text | Nullable | The prompt narrative describing the case. |
| `practiceHint` | Text | Nullable | Guidance tips/criteria used by the AI evaluator. |
| `deletedAt` | DateTime | Nullable | Soft delete timestamp. |
| `createdAt` | DateTime | Default: `now()` | Creation date. |
| `updatedAt` | DateTime | Auto-update | Last update date. |

---

## 8. QuizQuestion (quiz_questions)
End-of-lesson assessment questions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique question identifier. |
| `lessonId` | UUID | Foreign Key | References `Lesson.id`. Cascades on delete. |
| `order` | Int | Default: `0` | Sequence order. |
| `question` | Text | Not Null | Question text. |
| `options` | String[] | Not Null | Array of multiple-choice options. |
| `answer` | Int | Not Null | 0-indexed integer of the correct answer index. |
| `createdAt` | DateTime | Default: `now()` | Creation date. |
| `updatedAt` | DateTime | Auto-update | Last update date. |

---

## 9. QuizSubmission (quiz_submissions)
Records student answers for grading and statistics.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique submission identifier. |
| `userId` | UUID | Foreign Key | References `User.id`. Cascades on delete. |
| `questionId` | UUID | Foreign Key | References `QuizQuestion.id`. Cascades on delete. |
| `selectedAnswer`| Int | Not Null | The option index chosen by the user. |
| `isCorrect` | Boolean | Not Null | True if selectedAnswer equals correct answer. |
| `createdAt` | DateTime | Default: `now()` | Time submitted. |

---

## 10. CourseProgress (course_progress)
Tracks student status and daily goals.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique progress record key. |
| `userId` | UUID | FK, Unique Compound| References `User.id`. Cascades on delete. |
| `courseId` | UUID | FK, Unique Compound| References `Course.id`. Cascades on delete. |
| `lessonsDone` | Int | Default: `0` | Number of lessons completed. |
| `lessonsTotal`| Int | Default: `12` | Total number of lessons in the course. |
| `dailyGoal` | Int | Default: `1` | Daily lesson target set by the user. |
| `lastActivityAt`| DateTime | Default: `now()` | Last date the user studied this course. |
| `createdAt` | DateTime | Default: `now()` | Date course was started. |
| `updatedAt` | DateTime | Auto-update | Last progress update. |

---

## 11. ForumThread (forum_threads)
Discussions started by students or instructors within a course.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Thread identifier. |
| `courseId` | UUID | Foreign Key | References `Course.id`. Cascades on delete. |
| `authorId` | UUID | Foreign Key | References `User.id`. |
| `title` | VarChar(300) | Not Null | Thread header title. |
| `body` | Text | Not Null | Main thread body content. |
| `isPinned` | Boolean | Default: `false` | True if pinned at the top. |
| `deletedAt` | DateTime | Nullable | Soft-delete timestamp. |
| `createdAt` | DateTime | Default: `now()` | Time created. |
| `updatedAt` | DateTime | Auto-update | Last update timestamp. |

---

## 12. ForumReply (forum_replies)
Responses to a discussion thread.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Reply identifier. |
| `threadId` | UUID | Foreign Key | References `ForumThread.id`. Cascades on delete. |
| `authorId` | UUID | Foreign Key | References `User.id`. |
| `body` | Text | Not Null | Reply message text. |
| `deletedAt` | DateTime | Nullable | Soft-delete timestamp. |
| `createdAt` | DateTime | Default: `now()` | Time replied. |
| `updatedAt` | DateTime | Auto-update | Last update. |

---

## 13. Notification (notifications)
System-wide alerts and updates delivered to specific users.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique notification key. |
| `userId` | UUID | Foreign Key | References `User.id`. Cascades on delete. |
| `title` | VarChar(200) | Not Null | Alert header title. |
| `message` | Text | Not Null | Alert body details. |
| `type` | Enum (`NotificationType`)| Default: `SYSTEM` | Category (`COURSE_PROGRESS`, `FORUM_REPLY`, `ACHIEVEMENT`, `SYSTEM`, `REMINDER`). |
| `isRead` | Boolean | Default: `false` | Read status flag. |
| `metadata` | Json | Nullable | Additional structured info. |
| `createdAt` | DateTime | Default: `now()` | Time generated. |

---

## 14. AuditLog (audit_logs)
Tracks sensitive actions for administrative auditing.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique log identifier. |
| `userId` | UUID | Foreign Key | References `User.id`. Sets null on delete. |
| `action` | VarChar(50) | Not Null | Action type (e.g. "update_user", "publish_course"). |
| `resource` | VarChar(50) | Not Null | Target table/entity modified. |
| `resourceId` | VarChar(100) | Nullable | ID of the target modified record. |
| `oldData` | Json | Nullable | Pre-modification state snapshot. |
| `newData` | Json | Nullable | Post-modification state snapshot. |
| `ipAddress` | VarChar(45) | Nullable | Action initiator IP address. |
| `userAgent` | VarChar(500) | Nullable | Client user-agent info. |
| `createdAt` | DateTime | Default: `now()` | Log creation date. |

---

## 15. Setting (settings)
Global platform variables editable by admins.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Setting identifier. |
| `key` | VarChar(100) | Unique | Configuration reference key. |
| `value` | Text | Not Null | Current value string/json. |
| `type` | String | Default: "string" | Data parser identifier (e.g. "boolean", "number"). |
| `group` | String | Default: "general" | Category layout classification. |
| `label` | VarChar(200) | Nullable | Human readable label name. |
| `createdAt` | DateTime | Default: `now()` | Entry date. |
| `updatedAt` | DateTime | Auto-update | Last configuration change. |
