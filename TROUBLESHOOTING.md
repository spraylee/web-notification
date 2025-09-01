# Web 推送通知故障排除指南

## 常见问题及解决方案

### 1. 订阅失败 - "Registration failed - push service error"

**问题原因：**
- Service Worker 注册失败
- 浏览器通知权限被拒绝
- VAPID 密钥配置错误
- 网络连接问题

**解决步骤：**

1. **检查浏览器支持**
   - 使用 Chrome 88+, Firefox 78+, Safari 16.1+ 或 Edge 88+
   - 确保在 HTTPS 环境下测试（localhost 除外）

2. **检查控制台错误**
   - 打开浏览器开发者工具 (F12)
   - 查看 Console 标签页的错误信息
   - 查看 Application -> Service Workers 确认 SW 已注册

3. **权限检查**
   - 点击浏览器地址栏左侧的锁图标
   - 确保"通知"权限设为"允许"
   - 如果被拒绝，需要手动启用后刷新页面

4. **清除缓存和重置**
   ```bash
   # 在浏览器中
   1. 开发者工具 -> Application -> Storage
   2. 点击 "Clear storage" 清除所有数据
   3. 刷新页面重新尝试
   ```

### 2. 通知权限问题

**症状：** 权限状态显示"已拒绝"或"待授权"

**解决方案：**
1. **手动重置权限**
   - Chrome: 设置 -> 隐私设置和安全性 -> 网站设置 -> 通知
   - Firefox: 设置 -> 隐私与安全 -> 权限 -> 通知
   - 找到 localhost 并设置为"允许"

2. **程序化请求权限**
   - 代码已包含权限请求逻辑
   - 确保在用户交互（如点击按钮）时请求权限

### 3. Service Worker 问题

**症状：** SW 注册失败或无法找到 `/sw.js`

**解决方案：**
1. **检查文件路径**
   ```bash
   # 确保文件存在
   ls packages/web/public/sw.js
   ```

2. **验证 SW 内容**
   - 确保 sw.js 语法正确
   - 检查事件监听器是否正确注册

3. **重新注册 SW**
   ```javascript
   // 在开发者工具 Console 中执行
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
   ```

### 4. 网络和后端连接问题

**症状：** 订阅数据无法发送到服务器

**解决方案：**
1. **检查后端服务状态**
   ```bash
   curl http://localhost:3001/health
   # 应该返回: {"status":"ok","timestamp":"..."}
   ```

2. **检查 tRPC 连接**
   - 确保前端和后端都在运行
   - 检查端口配置是否正确
   - 查看网络请求是否成功（开发者工具 Network 标签）

### 5. VAPID 密钥问题

**症状：** "Vapid public key should be 65 bytes long when decoded"

**解决方案：**
1. **重新生成密钥**
   ```bash
   cd packages/server
   pnpm tsx src/generate-vapid-keys.ts
   ```

2. **更新配置**
   - 复制新的公钥到 `packages/web/src/hooks/usePushNotification.ts`
   - 复制私钥到 `packages/server/.env`

## 调试技巧

### 开发者工具检查清单

1. **Console 日志**
   - 查看详细的错误信息和调试日志
   - 注意任何红色错误消息

2. **Application 标签页**
   - Service Workers: 确认 SW 已激活
   - Storage: 检查 IndexedDB/LocalStorage
   - Manifest: 验证 PWA 清单文件

3. **Network 标签页**
   - 检查 API 请求是否成功
   - 查看请求头和响应数据

### 逐步测试

1. **基础功能测试**
   ```javascript
   // 在 Console 中测试
   console.log('SW支持:', 'serviceWorker' in navigator);
   console.log('Push支持:', 'PushManager' in window);
   console.log('通知支持:', 'Notification' in window);
   console.log('当前权限:', Notification.permission);
   ```

2. **手动权限请求**
   ```javascript
   // 在 Console 中执行
   Notification.requestPermission().then(permission => {
     console.log('权限结果:', permission);
   });
   ```

3. **测试通知显示**
   ```javascript
   // 在权限授予后测试
   new Notification('测试通知', {
     body: '如果看到这个，说明通知功能正常',
     icon: '/icon.svg'
   });
   ```

## 环境要求

- **开发环境**: localhost 可以使用 HTTP
- **生产环境**: 必须使用 HTTPS
- **浏览器**: 现代浏览器且启用通知功能
- **网络**: 确保能访问推送服务 (FCM/Mozilla等)

如果以上方法都无法解决问题，请检查浏览器的推送服务是否正常工作，或尝试使用不同的浏览器测试。