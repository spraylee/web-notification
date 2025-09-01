self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.svg',
      badge: data.badge || '/icon.svg',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'explore',
          title: '查看详情',
          icon: '/action-explore.png'
        },
        {
          action: 'close',
          title: '关闭',
          icon: '/action-close.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 通知已经被关闭了
  } else {
    // 默认点击行为
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('通知被关闭:', event.notification.title);
});