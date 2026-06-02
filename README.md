# EducAndes — Allin Yachay 🌄

> Plataforma educativa web empresarial para comunidades andinas del Perú.  
> Tecnología + Ganadería + Cultivo + Negocios — en Español, Quechua, Aymara y Shipibo.

---

## 🚀 Inicio rápido (Docker)

```bash
# 1. Clonar o descomprimir el proyecto
cd EducAndes

# 2. Configurar variables de entorno
cp .env.example .env
# (opcional: editar .env con tus contraseñas)

# 3. Levantar todo el sistema
docker-compose up -d

# 4. Esperar ~30s a que la DB inicie y el backend ejecute migraciones + seed
# Verificar estado:
docker-compose logs -f backend

# 5. Acceder:
# Frontend:  http://localhost
# API Docs:  http://localhost:3001/api/docs
# Backend:   http://localhost:3001/api/v1
```

---

## 💻 Desarrollo local (sin Docker)

### Requisitos
- Node.js 20+
- PostgreSQL 16+
- npm o pnpm

### Backend

```bash
cd backend
npm install

# Configurar .env (ya existe con valores por defecto para desarrollo)
# Asegúrate de tener PostgreSQL corriendo con:
# Usuario: educandes | Password: educandes_secret | DB: educandes_db

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Poblar base de datos (cursos, usuarios demo, roles)
npx ts-node prisma/seed.ts

# Iniciar servidor de desarrollo
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Accesos
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api/v1
- **Swagger Docs**: http://localhost:3001/api/docs

---

## 🔑 Credenciales de prueba

| Rol | DNI | Contraseña |
|-----|-----|------------|
| Administrador | `00000001` | `Admin2025!` |
| Docente | `87654321` | `Docente2025!` |
| Estudiante (demo) | `12345678` | `andes2025` |

---

## 📐 Arquitectura del sistema

```
EducAndes/
├── backend/                    # NestJS + TypeScript
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT, Refresh Tokens, Bcrypt
│   │   │   ├── users/          # Gestión de usuarios
│   │   │   ├── roles/          # Roles y permisos RBAC
│   │   │   ├── courses/        # Cursos con categorías
│   │   │   ├── lessons/        # Lecciones + Quiz
│   │   │   ├── progress/       # Progreso académico por usuario
│   │   │   ├── forums/         # Hilos y respuestas
│   │   │   ├── notifications/  # Notificaciones en tiempo real
│   │   │   ├── dashboard/      # Métricas y estadísticas
│   │   │   └── audit/          # Logs de auditoría
│   │   ├── common/
│   │   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   │   ├── decorators/     # @CurrentUser, @Roles, @Public
│   │   │   ├── filters/        # HttpExceptionFilter global
│   │   │   └── interceptors/   # TransformInterceptor (respuesta unificada)
│   │   └── prisma/             # PrismaService global
│   └── prisma/
│       ├── schema.prisma       # Esquema completo con 12 modelos
│       └── seed.ts             # Datos iniciales (8 cursos, 96 lecciones)
│
├── frontend/                   # React + TypeScript + Vite
│   └── src/
│       ├── pages/              # 9 páginas (Home, Auth, Cursos, Metas, Foros, Admin)
│       ├── services/           # Axios: api.ts + auth/courses/users services
│       ├── store/              # Zustand: auth.store + i18n.store
│       └── components/        # SiteHeader, AndeanBorder + UI components
│
├── docker-compose.yml          # Postgres + Backend + Frontend
├── .env.example                # Variables de entorno documentadas
└── README.md
```

---

## 🗄️ Modelo de datos

### Entidades principales

| Entidad | Descripción |
|---------|-------------|
| `User` | Usuarios con DNI, rol, idioma preferido |
| `Role` | admin / docente / estudiante |
| `Permission` | Permisos granulares por recurso/acción |
| `Course` | 8 cursos con categoría, nivel, duración |
| `Lesson` | 12 lecciones por curso con quiz |
| `QuizQuestion` | 3 preguntas por lección |
| `QuizSubmission` | Respuestas de usuarios |
| `CourseProgress` | Progreso por usuario × curso |
| `ForumThread` | Hilos de discusión por curso |
| `ForumReply` | Respuestas en hilos |
| `Notification` | Notificaciones del sistema |
| `AuditLog` | Registro de acciones sensibles |
| `Setting` | Configuración de la plataforma |
| `RefreshToken` | Tokens de refresco JWT |

---

## 🔐 Seguridad

- **JWT** con expiración de 15 minutos
- **Refresh Tokens** con rotación automática
- **Bcrypt** (12 rounds) para contraseñas
- **RBAC** (Role-Based Access Control)
- **Helmet** para headers de seguridad HTTP
- **Throttling** (100 req/min por IP)
- **Validación** con `class-validator` en todos los DTOs
- **Soft Delete** en entidades sensibles
- **Audit Logs** para acciones críticas
- **CORS** configurado para dominios específicos

---

## 📡 API Endpoints principales

```
POST /api/v1/auth/register        Registrar nuevo usuario
POST /api/v1/auth/login           Iniciar sesión
POST /api/v1/auth/refresh         Renovar access token
GET  /api/v1/auth/me              Perfil del usuario autenticado

GET  /api/v1/courses              Listar cursos públicos
GET  /api/v1/courses/:slug        Detalle del curso con lecciones
GET  /api/v1/courses/with-progress  Cursos + progreso del usuario

GET  /api/v1/courses/:id/lessons  Lecciones del curso
GET  /api/v1/courses/:id/lessons/:n  Lección por índice

GET  /api/v1/progress             Progreso completo del usuario
POST /api/v1/progress/:courseId   Actualizar progreso

GET  /api/v1/forums/courses/:courseId/threads    Hilos del foro
POST /api/v1/forums/courses/:courseId/threads    Crear hilo
GET  /api/v1/forums/threads/:id/replies          Respuestas
POST /api/v1/forums/threads/:id/replies          Responder

GET  /api/v1/notifications         Mis notificaciones
GET  /api/v1/notifications/unread-count  Conteo no leídas

GET  /api/v1/dashboard/student     Dashboard del estudiante
GET  /api/v1/dashboard/admin       [Admin] Métricas globales
GET  /api/v1/users                 [Admin] Listar usuarios
```

Documentación completa: **http://localhost:3001/api/docs**

---

## 🌍 Idiomas soportados

| Código | Idioma |
|--------|--------|
| `es` | Español |
| `qu` | Quechua (Runasimi) |
| `ay` | Aymara (Aymar aru) |
| `shp` | Shipibo-Konibo |

---

## 📦 Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Routing | React Router v6 |
| Estado | Zustand (auth + i18n) |
| Data fetching | TanStack Query (React Query v5) |
| HTTP | Axios con interceptores JWT |
| Backend | NestJS 10, TypeScript |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + Refresh Tokens + Bcrypt |
| Documentación | Swagger (OpenAPI 3) |
| Infraestructura | Docker, Docker Compose |
| Seguridad | Helmet, Throttler, CORS, Guards |

---

## 🔮 Roadmap futuro

- [ ] WebSockets para notificaciones en tiempo real
- [ ] Chat entre estudiantes y docentes
- [ ] Videoconferencias integradas
- [ ] Certificaciones digitales con QR
- [ ] Gamificación (badges, puntos, rankings)
- [ ] App móvil (React Native)
- [ ] IA educativa para recomendaciones personalizadas
- [ ] Integración con Senamhi (datos climáticos en tiempo real)
- [ ] Pagos con Yape/Plin para cursos premium

---

## 👥 Equipo y decisiones de arquitectura

**Decisiones tomadas:**
1. **DNI como identificador de login** — Los usuarios andinos conocen su DNI pero no siempre tienen email activo.
2. **Soft Delete en todas las entidades** — Para auditoría y recuperación de datos sin pérdida de historial.
3. **Refresh Token con rotación** — Cada uso del refresh token genera uno nuevo, revocando el anterior.
4. **TailwindCSS con tokens andinos** — Colores `puna`, `sun`, `earth`, `sky` reflejan el paisaje andino.
5. **React Query para data fetching** — Cache automático, re-fetch inteligente, mejor UX.
6. **Zustand para estado global** — Más simple que Redux, suficiente para auth + i18n.

---

*EducAndes — Allin Yachay · ONG sin fines de lucro · Todos los cursos son gratuitos*
