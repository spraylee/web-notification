# 阶段 1: 基础镜像
FROM node:20-alpine AS base
RUN apk add --no-cache openssl \
    && npm install -g pnpm@9

# 阶段 2: 依赖安装
FROM base AS deps
WORKDIR /app

# 复制依赖配置文件
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json ./packages/server/

# 安装依赖（利用 BuildKit 缓存）
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter server

# 阶段 3: 构建
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/server/node_modules ./packages/server/node_modules

# 生成 Prisma Client
COPY packages/server/prisma ./packages/server/prisma
COPY packages/server/package.json ./packages/server/
RUN pnpm --filter server db:generate

# 复制源码并构建
COPY packages/server/src ./packages/server/src
COPY packages/server/tsconfig.json ./packages/server/
RUN pnpm --filter server build

# 阶段 4: 运行
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app/packages/server

ENV NODE_ENV=production
ENV PORT=10901

# 复制构建产物
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/packages/server/node_modules ./node_modules
COPY --from=builder /app/node_modules /app/node_modules

# 启动脚本
COPY packages/server/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 10901
CMD ["./docker-entrypoint.sh"]
