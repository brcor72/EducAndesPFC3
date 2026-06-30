# EducAndes / Allin Yachay

Plataforma educativa para comunidades andinas y amazónicas del Perú. Ofrece cursos
prácticos (campo, negocio, tecnología, energía) con contenido disponible en **español,
quechua, aymara y shipibo-konibo**, foros por curso, seguimiento de progreso y un panel
de administración.

## Stack

| Capa     | Tecnología                                             |
| -------- | ------------------------------------------------------ |
| Backend  | NestJS, Prisma ORM, PostgreSQL, JWT (access + refresh) |
| Frontend | React, Vite, TypeScript                                |
| IA       | Traducción asistida a lenguas originarias (OpenAI)     |
| Infra    | Docker Compose, despliegue en Render/Railway           |

## Estructura del repositorio

```
EducAndesPFC3/
├── backend/      API REST con NestJS + Prisma (ver backend/README.md)
├── frontend/     SPA con React + Vite
├── source/       Prototipo de referencia (andes-connect-learn)
├── docker-compose.yml
└── .env.example  Plantilla de variables de entorno
```

## Puesta en marcha rápida

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/brcor72/EducAndesPFC3.git
   cd EducAndesPFC3
   ```

2. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Completa los valores (base de datos, `JWT_SECRET`, etc.).

3. **Backend**

   ```bash
   cd backend
   npm install
   npm run prisma:migrate     # crea el esquema en la base de datos
   npm run prisma:seed        # datos iniciales (roles, cursos demo)
   npm run start:dev          # API en modo desarrollo
   ```

4. **Frontend** (en otra terminal)

   ```bash
   cd frontend
   npm install
   npm run dev                # SPA en modo desarrollo
   ```

## Idiomas soportados

| Código | Idioma         |
| ------ | -------------- |
| `es`   | Español        |
| `qu`   | Quechua        |
| `ay`   | Aymara         |
| `shp`  | Shipibo-Konibo |

## Pruebas

El backend incluye pruebas unitarias con Jest:

```bash
cd backend
npm test           # ejecuta toda la suite
npm run test:cov   # con reporte de cobertura
```

## Equipo

Proyecto desarrollado por el Grupo 04 como parte del curso de Ingeniería de Software.
