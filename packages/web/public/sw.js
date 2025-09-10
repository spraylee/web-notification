self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();

    // 将完整通知数据存储到 data 字段
    const notificationData = {
      title: data.title,
      body: data.body,
      icon: data.icon,
      timestamp: new Date().toISOString(),
      url: '/',
    };

    // 使用从后端传来的 actions，如果没有则使用默认的
    const actions = data.actions || [
      {
        action: 'open',
        title: '打开应用',
      },
      {
        action: 'close',
        title: '关闭',
      },
    ];

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.svg',
      badge: data.badge || '/icon.svg',
      image: data.image, // 添加大图支持
      vibrate: [100, 50, 100],
      data: { ...notificationData, actions }, // 将 actions 也存储到 data 中
      requireInteraction: true, // 让通知持久显示
      actions: actions.map(action => ({
        action: action.action,
        title: action.title,
      })),
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('通知被点击:', event.notification.title, 'Action:', event.action);
  event.notification.close();

  // 获取通知数据和 actions
  const notificationData = event.notification.data || {};
  const actions = notificationData.actions || [];
  
  // 如果是 close action，直接返回
  if (event.action === 'close') {
    return;
  }

  // 查找被点击的 action
  const clickedAction = actions.find(action => action.action === event.action);
  let targetUrl;

  if (clickedAction && clickedAction.url) {
    // 如果 action 有自定义 URL，使用它
    targetUrl = clickedAction.url;
    // 添加 action 参数以便页面知道是通过哪个 action 访问的
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl += `${separator}action=${encodeURIComponent(event.action)}&notificationId=${encodeURIComponent(notificationData.title || '')}`;
  } else if (event.action) {
    // 如果有 action 但没有自定义 URL，跳转到通知页面并包含 action 信息
    targetUrl = `/notification?title=${encodeURIComponent(notificationData.title || '')}&body=${encodeURIComponent(notificationData.body || '')}&timestamp=${encodeURIComponent(notificationData.timestamp || '')}&action=${encodeURIComponent(event.action)}`;
  } else {
    // 点击通知本身（不是按钮），跳转到通知页面
    targetUrl = `/notification?title=${encodeURIComponent(notificationData.title || '')}&body=${encodeURIComponent(notificationData.body || '')}&timestamp=${encodeURIComponent(notificationData.timestamp || '')}`;
  }

  event.waitUntil(
    // 优先尝试聚焦现有窗口
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // 查找现有的应用窗口
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin)) {
            console.log('聚焦现有窗口并导航到:', targetUrl);
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        // 如果没有现有窗口，打开新窗口
        console.log('打开新窗口:', targetUrl);
        return clients.openWindow(targetUrl);
      })
      .catch(function (error) {
        console.error('处理通知点击失败:', error);
        // 降级处理：直接打开首页
        return clients.openWindow('/');
      })
  );
});

self.addEventListener('notificationclose', function (event) {
  console.log('通知被关闭:', event.notification.title);
});
