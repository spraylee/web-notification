# Web 推送通知 Demo

一个完整的 Web 推送通知演示系统，支持离线推送功能。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 生成 VAPID 密钥
cd packages/server && pnpm tsx src/generate-vapid-keys.ts

# 设置环境变量
cp packages/server/.env.example packages/server/.env
# 编辑 .env 文件填入生成的 VAPID 密钥

# 设置数据库
cd packages/server && pnpm db:generate && pnpm db:push

# 更新前端 VAPID 公钥
# 将生成的公钥复制到 packages/web/src/hooks/usePushNotification.ts

# 启动所有服务
pnpm dev
```

详细安装步骤请参考 [SETUP.md](./SETUP.md)

## 📱 项目结构

- **packages/web** - 用户端 React 应用 (端口: 5173)
- **packages/admin** - 管理端 React 应用 (端口: 5174) 
- **packages/server** - Node.js 后端服务 (端口: 3001)

## 🛠 技术栈

- **前端**: React 18, TypeScript, Vite, TailwindCSS, Radix UI
- **后端**: Node.js, Express, tRPC, Prisma
- **数据库**: SQLite
- **推送**: Web Push Protocol
- **包管理**: pnpm monorepo

## ✨ 功能特性

- ✅ Web 推送通知订阅/取消订阅
- ✅ 离线推送支持 (Service Worker)
- ✅ 实时通知发送管理
- ✅ 订阅用户统计
- ✅ 通知历史记录
- ✅ 响应式 UI 设计
- ✅ TypeScript 类型安全

## 🌐 访问地址

- Web 用户端: http://localhost:5173
- 管理端: http://localhost:5174
- 后端 API: http://localhost:3001
