# 部署说明

## GitHub Actions 自动部署

本项目使用 GitHub Actions 实现自动部署，推送到 `main` 分支时会自动触发部署。

### 部署架构

- **前端 (Web)**: 部署到 `/data/web-notification/web`，通过 nginx 提供静态文件服务
- **管理端 (Admin)**: 部署到 `/data/web-notification/admin`，通过 nginx 提供静态文件服务  
- **后端 (Server)**: 部署到 `/data/web-notification/server`，使用 PM2 运行 Node.js 服务
- **配置文件**: nginx.conf 和 ecosystem.config.js 复制到 `/data/web-notification/`

### 所需的 GitHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥：

```
HOST=你的服务器IP或域名
USERNAME=SSH用户名
PASSWORD=SSH密码
PORT=SSH端口（默认22，可选）
DATABASE_URL=数据库连接字符串（如：file:/data/web-notification/server/dev.db）
VAPID_PUBLIC_KEY=VAPID公钥
VAPID_PRIVATE_KEY=VAPID私钥
```

### 部署流程

1. **构建阶段**:
   - 安装 pnpm 依赖
   - 生成 Prisma 客户端
   - 构建所有包（web、admin、server）
   - 创建部署压缩包

2. **部署阶段**:
   - 停止现有 PM2 服务
   - 上传所有文件到服务器
   - 解压文件到对应目录
   - 设置环境变量
   - 运行数据库迁移
   - 启动/重启 PM2 服务
   - 重新加载 nginx 配置

### 服务器目录结构

```
/data/web-notification/
├── web/                    # Web 前端静态文件
├── admin/                  # Admin 前端静态文件
├── server/                 # Node.js 服务端
│   ├── dist/              # 编译后的 JS 文件
│   ├── node_modules/      # 依赖
│   ├── prisma/           # Prisma 配置
│   ├── package.json      # 包配置
│   └── .env             # 环境变量
├── logs/                   # PM2 日志
├── nginx.conf             # nginx 配置
└── ecosystem.config.js    # PM2 配置
```

### 手动部署

如需手动部署，可以在 GitHub Actions 页面手动触发 workflow：

1. 进入 GitHub 仓库
2. 点击 Actions 标签
3. 选择 "Deploy to Production" workflow  
4. 点击 "Run workflow" 按钮

### 服务器要求

- **Node.js**: 18+ 版本
- **PM2**: 全局安装 (`npm install -g pm2`)
- **nginx**: 已安装并运行
- **权限**: SSH 用户需要对 `/data/web-notification/` 目录有读写权限

### nginx 配置

部署后需要确保 nginx 加载了项目配置：

```bash
# 检查配置文件
nginx -t

# 如果使用 sites-available 方式，需要创建软链接
ln -sf /data/web-notification/nginx.conf /etc/nginx/sites-available/web-notification
ln -sf /etc/nginx/sites-available/web-notification /etc/nginx/sites-enabled/

# 重新加载配置
nginx -s reload
```

### 监控和维护

```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs web-notification-server

# 重启服务
pm2 restart web-notification-server

# 查看 nginx 状态
systemctl status nginx

# 查看 nginx 日志
tail -f /var/log/nginx/error.log
```

### 故障排除

1. **部署失败**: 检查 GitHub Actions 日志
2. **服务启动失败**: 检查 PM2 日志 `/data/web-notification/logs/`
3. **前端访问失败**: 检查 nginx 配置和静态文件权限
4. **API 请求失败**: 检查后端服务状态和端口配置