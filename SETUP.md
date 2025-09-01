# Web 推送通知 Demo 安装指南

这是一个完整的 Web 推送通知演示项目，包含用户端、管理端和后端服务。

## 项目结构

```
web-notification/
├── packages/
│   ├── web/          # 用户端 React 应用
│   ├── admin/        # 管理端 React 应用
│   └── server/       # Node.js 后端服务 (tRPC + Prisma + SQLite)
├── package.json      # 根目录 package.json
├── pnpm-workspace.yaml
└── SETUP.md         # 本文件
```

## 安装步骤

### 1. 安装依赖

```bash
# 确保安装了 pnpm
npm install -g pnpm

# 在项目根目录安装所有依赖
pnpm install
```

### 2. 设置后端服务

```bash
# 进入 server 目录
cd packages/server

# 生成 VAPID 密钥对
pnpm tsx src/generate-vapid-keys.ts

# 复制环境变量模板并填入生成的密钥
cp .env.example .env
# 编辑 .env 文件，填入生成的 VAPID_PUBLIC_KEY 和 VAPID_PRIVATE_KEY

# 生成 Prisma 客户端并推送数据库模式
pnpm db:generate
pnpm db:push
```

### 3. 更新前端 VAPID 公钥

复制生成的 `VAPID_PUBLIC_KEY` 到：

- `packages/web/src/hooks/usePushNotification.ts` 文件中的 `VAPID_PUBLIC_KEY` 常量

### 4. 启动所有服务

在项目根目录运行：

```bash
# 并行启动所有服务
pnpm dev
```

这会启动：

- Web 用户端: http://localhost:5173
- Admin 管理端: http://localhost:5174
- Server 后端: http://localhost:10901

### 5. 使用说明

1. **用户端** (http://localhost:5173):
   - 用户可以订阅推送通知
   - 接收来自管理端发送的通知

2. **管理端** (http://localhost:5174):
   - 查看活跃订阅数量
   - 发送推送通知给所有订阅用户
   - 查看通知历史记录

3. **后端 API** (http://localhost:10901):
   - tRPC API 端点: http://localhost:10901/trpc
   - 健康检查: http://localhost:10901/health

## 技术栈

- **前端**: React 18, TypeScript, Vite, TailwindCSS, Radix UI
- **状态管理**: TanStack Query + tRPC
- **后端**: Node.js, Express, tRPC, Prisma
- **数据库**: SQLite
- **推送服务**: Web Push Protocol (使用 web-push 库)
- **包管理**: pnpm + monorepo

## 开发命令

```bash
# 单独启动某个服务
pnpm web:dev    # 启动用户端
pnpm admin:dev  # 启动管理端
pnpm server:dev # 启动后端服务

# 构建所有项目
pnpm build

# 清理构建文件
pnpm clean

# 格式化代码
pnpm format

# 数据库相关命令 (在 packages/server 目录下)
pnpm db:generate  # 生成 Prisma 客户端
pnpm db:push      # 推送数据库模式
pnpm db:migrate   # 运行数据库迁移
pnpm db:studio    # 启动 Prisma Studio
```

## 注意事项

1. **HTTPS 要求**: 在生产环境中，Web 推送必须在 HTTPS 下工作
2. **浏览器支持**: 确保使用支持 Service Worker 和 Push API 的现代浏览器
3. **通知权限**: 用户需要主动授予通知权限才能接收推送
4. **VAPID 密钥**: 在生产环境中妥善保管 VAPID 私钥
