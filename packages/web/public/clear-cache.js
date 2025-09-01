// 在浏览器控制台中运行此脚本来清理缓存和重置 Service Worker
console.log('🧹 开始清理缓存和重置 Service Worker...');

// 1. 取消注册所有 Service Worker
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  console.log('📋 找到', registrations.length, '个 Service Worker');
  for(let registration of registrations) {
    registration.unregister().then(function() {
      console.log('✅ 已取消注册 Service Worker:', registration.scope);
    });
  }
});

// 2. 清除所有缓存
caches.keys().then(function(cacheNames) {
  console.log('📋 找到', cacheNames.length, '个缓存');
  return Promise.all(
    cacheNames.map(function(cacheName) {
      return caches.delete(cacheName).then(function() {
        console.log('✅ 已删除缓存:', cacheName);
      });
    })
  );
});

// 3. 清除推送订阅
navigator.serviceWorker.ready.then(function(registration) {
  return registration.pushManager.getSubscription();
}).then(function(subscription) {
  if (subscription) {
    return subscription.unsubscribe().then(function() {
      console.log('✅ 已取消推送订阅');
    });
  } else {
    console.log('ℹ️  没有找到推送订阅');
  }
});

console.log('🔄 请刷新页面完成重置');
console.log('💡 提示：也可以在开发者工具 > Application > Storage 中点击 "Clear storage"');