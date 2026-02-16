#!/bin/sh
set -e

echo "Running Prisma migrations..."
/prisma-cli/node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma

echo "Starting Next.js server..."
exec node server.js
