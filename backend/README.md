# Backend — EducAndes API

API REST construida con **NestJS**, **Prisma** y **PostgreSQL**. Maneja autenticación
con JWT (access + refresh token), cursos y lecciones multilingües, foros, progreso de los
estudiantes, notificaciones, auditoría y un panel de administración.

## Requisitos

- Node.js 18+
- PostgreSQL (local o vía `docker-compose` en la raíz del proyecto)

## Instalación

```bash
npm install
cp ../.env.example ../.env   # completa DATABASE_URL, JWT_SECRET, etc.
npm run prisma:generate      # genera el cliente de Prisma
npm run prisma:migrate       # aplica las migraciones
npm run prisma:seed          # carga datos iniciales
```

## Scripts disponibles

| Script                      | Descripción                                  |
| --------------------------- | -------------------------------------------- |
| `npm run start:dev`         | Levanta la API con recarga en caliente       |
| `npm run start:prod`        | Aplica migraciones y arranca en producción   |
| `npm run build`             | Compila TypeScript a `dist/`                 |
| `npm test`                  | Ejecuta las pruebas unitarias (Jest)         |
| `npm run test:cov`          | Pruebas con reporte de cobertura             |
| `npm run lint`              | Linting con ESLint                           |
| `npm run prisma:studio`     | Explora la base de datos en el navegador     |

## Estructura

```
backend/src/
├── common/         Guards, filtros, interceptores, decoradores y utilidades
│   ├── filters/    HttpExceptionFilter (formato de errores)
│   ├── guards/     JwtAuthGuard, RolesGuard
│   └── utils/      pick-lang (resolución de idioma por campo)
├── modules/        Un módulo por dominio (auth, users, courses, lessons,
│                   progress, forums, notifications, dashboard, roles,
│                   translations, audit, tutor, rag)
├── prisma/         PrismaService (conexión)
└── main.ts         Punto de entrada
```

Cada módulo sigue el patrón controller → service, con DTOs validados mediante
`class-validator`.

## Variables de entorno

| Variable                     | Uso                                            |
| ---------------------------- | ---------------------------------------------- |
| `DATABASE_URL`               | Cadena de conexión a PostgreSQL                |
| `JWT_SECRET`                 | Secreto para firmar los access tokens          |
| `JWT_EXPIRES_IN`             | Vigencia del access token (ej. `15m`)          |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Días de vigencia del refresh token             |
| `PORT`                       | Puerto de la API                               |
| `FRONTEND_URL`               | Origen permitido para CORS                     |
| `OPENAI_API_KEY`             | Traducción asistida a lenguas originarias      |

## Pruebas

Las pruebas viven junto al código que prueban, con el sufijo `.spec.ts`
(por ejemplo `roles.service.spec.ts`). Para ejecutarlas:

```bash
npm test
```

> Si aparece un error de tipos relacionado con Prisma, ejecuta primero
> `npm run prisma:generate` para regenerar el cliente.
