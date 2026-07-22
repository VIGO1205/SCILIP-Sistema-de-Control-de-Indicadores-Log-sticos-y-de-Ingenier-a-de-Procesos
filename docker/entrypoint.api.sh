#!/bin/sh
set -e

echo "⏳ Esperando a PostgreSQL..."
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; do
  echo "  PostgreSQL no está listo todavía — esperando 2s..."
  sleep 2
done
echo "✅ PostgreSQL está listo."

echo "🔄 Ejecutando migraciones de Prisma (db push)..."
npx prisma@5.22.0 db push --skip-generate --schema=./backend/database/prisma/schema.prisma

echo "✅ Startup process complete."

echo "🚀 Iniciando la API..."
exec node backend/api/dist/main.js
