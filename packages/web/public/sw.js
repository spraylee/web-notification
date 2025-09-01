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

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.svg',
      badge: data.badge || '/icon.svg',
      vibrate: [100, 50, 100],
      data: notificationData, // 传递完整数据
      requireInteraction: true, // 让通知持久显示
      actions: [
        {
          action: 'open',
          title: '打开应用',
        },
        {
          action: 'close',
          title: '关闭',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('通知被点击:', event.notification.title);
  event.notification.close();

  if (event.action === 'close') {
    // 仅关闭通知，不做其他操作
    return;
  }

  // 获取通知数据
  const notificationData = event.notification.data || {};
  const targetUrl = `/notification?title=${encodeURIComponent(notificationData.title || '')}&body=${encodeURIComponent(notificationData.body || '')}&timestamp=${encodeURIComponent(notificationData.timestamp || '')}`;

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
