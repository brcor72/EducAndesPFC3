-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('INICIAL', 'INTERMEDIO', 'AVANZADO');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('CAMPO', 'NEGOCIO', 'TECNOLOGIA', 'ENERGIA');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COURSE_PROGRESS', 'FORUM_REPLY', 'ACHIEVEMENT', 'SYSTEM', 'REMINDER');

-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('es', 'qu', 'ay', 'shp');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "dni" VARCHAR(8) NOT NULL,
    "email" VARCHAR(255),
    "displayName" VARCHAR(100) NOT NULL,
    "community" VARCHAR(100),
    "preferredLang" "Lang" NOT NULL DEFAULT 'es',
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "titleQu" VARCHAR(200),
    "titleAy" VARCHAR(200),
    "short" VARCHAR(300) NOT NULL,
    "shortQu" VARCHAR(300),
    "long" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "iconName" VARCHAR(50),
    "level" "CourseLevel" NOT NULL DEFAULT 'INICIAL',
    "durationWeeks" INTEGER NOT NULL DEFAULT 4,
    "category" "CourseCategory" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "summary" VARCHAR(400) NOT NULL,
    "detail" TEXT NOT NULL,
    "isPractice" BOOLEAN NOT NULL DEFAULT false,
    "practiceTitle" VARCHAR(200),
    "practiceScenario" TEXT,
    "practiceHint" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "answer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonsDone" INTEGER NOT NULL DEFAULT 0,
    "lessonsTotal" INTEGER NOT NULL DEFAULT 12,
    "dailyGoal" INTEGER NOT NULL DEFAULT 1,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_threads" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "body" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_replies" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" VARCHAR(50) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "resourceId" VARCHAR(100),
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'string',
    "group" VARCHAR(50) NOT NULL DEFAULT 'general',
    "label" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_dni_idx" ON "users"("dni");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_category_idx" ON "courses"("category");

-- CreateIndex
CREATE INDEX "courses_isPublished_idx" ON "courses"("isPublished");

-- CreateIndex
CREATE INDEX "lessons_courseId_idx" ON "lessons"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_courseId_index_key" ON "lessons"("courseId", "index");

-- CreateIndex
CREATE INDEX "quiz_questions_lessonId_idx" ON "quiz_questions"("lessonId");

-- CreateIndex
CREATE INDEX "quiz_submissions_userId_questionId_idx" ON "quiz_submissions"("userId", "questionId");

-- CreateIndex
CREATE INDEX "course_progress_userId_idx" ON "course_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "course_progress_userId_courseId_key" ON "course_progress"("userId", "courseId");

-- CreateIndex
CREATE INDEX "forum_threads_courseId_idx" ON "forum_threads"("courseId");

-- CreateIndex
CREATE INDEX "forum_threads_authorId_idx" ON "forum_threads"("authorId");

-- CreateIndex
CREATE INDEX "forum_replies_threadId_idx" ON "forum_replies"("threadId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_group_idx" ON "settings"("group");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "forum_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
