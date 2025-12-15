#!/bin/sh
set -e

# 同步数据库表结构
echo "Syncing database schema..."
npx prisma db push --skip-generate

echo "Starting server..."
exec node dist/index.js
