FROM node:20-slim AS builder

# Instalar OpenSSL para Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Production stage ────────────────────────────────────────────────────────
FROM node:20-slim AS production

# Instalar OpenSSL (requerido por Prisma en runtime)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

# Ejecutar migraciones y arrancar (seed se ejecuta manualmente desde Railway)
CMD ["sh", "-c", "npx prisma db execute --file prisma/fix_columns.sql --schema prisma/schema.prisma; npx prisma migrate resolve --rolled-back 20260630000002_summary_translations_to_text 2>/dev/null; npx prisma migrate resolve --rolled-back 20260630000003_title_translations_to_text 2>/dev/null; npx prisma migrate deploy && node dist/main || node dist/main"]
