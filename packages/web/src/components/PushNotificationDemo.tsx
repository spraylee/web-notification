import React, { useEffect } from 'react';
import { usePushNotification } from '../hooks/usePushNotification';

export function PushNotificationDemo() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotification();

  useEffect(() => {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW 注册成功:', registration);
        })
        .catch((error) => {
          console.log('SW 注册失败:', error);
        });
    }
  }, []);

  if (!isSupported) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">不支持推送通知</h2>
        <p className="text-red-600">你的浏览器不支持 Web 推送通知功能。</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Web 推送通知演示</h1>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">推送通知状态:</span>
          <span className={`font-medium ${isSubscribed ? 'text-green-600' : 'text-gray-500'}`}>
            {isSubscribed ? '已订阅' : '未订阅'}
          </span>
        </div>

        {!isSubscribed ? (
          <button
            onClick={subscribe}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            订阅推送通知
          </button>
        ) : (
          <button
            onClick={unsubscribe}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            取消订阅
          </button>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>订阅后，你将能够接收来自此应用的推送通知。</p>
          <p className="mt-1">即使关闭浏览器也能收到通知。</p>
        </div>
      </div>
    </div>
  );
}