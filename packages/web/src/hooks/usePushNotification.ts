import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc-client';
import type { PushSubscriptionData } from '../types';

const VAPID_PUBLIC_KEY =
  'BOSJUkRWhT0SI7gGN8CqZV3pi48voHpkQ1qdGeYm1ndAdm50u7dChXS_l7d4qFyYh0P9_7-YEcz7XJ1mDSCMmOM';

// 浏览器环境检测
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isStandalone = (window.navigator as any).standalone === true;
  const isInWebAppiOS = window.matchMedia('(display-mode: standalone)').matches;
  
  return {
    isSafari,
    isIOS,
    isStandalone: isStandalone || isInWebAppiOS,
    supportsWebPush: 'serviceWorker' in navigator && 'PushManager' in window,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [browserInfo] = useState(getBrowserInfo());

  const createSubscription = trpc.subscription.create.useMutation();

  useEffect(() => {
    // 检查浏览器支持
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Safari 兼容性检查
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isSafari) {
        console.log('检测到 Safari 浏览器');
        if (isIOS) {
          console.log('检测到 iOS Safari，需要添加到主屏幕才能使用推送功能');
        }
      }

      // 注册 Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 注册成功:', registration);
          return registration.pushManager.getSubscription();
        })
        .then((sub) => {
          setSubscription(sub);
          setIsSubscribed(!!sub);
        })
        .catch((error) => {
          console.error('Service Worker 注册失败:', error);
        });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) {
      alert('你的浏览器不支持推送通知');
      return;
    }

    setIsLoading(true);

    try {
      // 1. 请求通知权限
      if (permission === 'default') {
        const newPermission = await Notification.requestPermission();
        setPermission(newPermission);

        if (newPermission !== 'granted') {
          alert('需要授予通知权限才能订阅推送');
          setIsLoading(false);
          return;
        }
      } else if (permission === 'denied') {
        alert('通知权限被拒绝，请在浏览器设置中启用通知权限');
        setIsLoading(false);
        return;
      }

      // 2. 等待 Service Worker 就绪
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker 就绪:', registration);

      // 3. 订阅推送
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('推送订阅成功:', sub);

      // 4. 准备订阅数据
      const subscriptionData: PushSubscriptionData = {
        endpoint: sub.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
      };

      // 5. 发送到服务器
      await createSubscription.mutateAsync(subscriptionData);
      console.log('订阅数据已发送到服务器');

      setSubscription(sub);
      setIsSubscribed(true);

      // 显示成功通知
      new Notification('订阅成功!', {
        body: '你已成功订阅推送通知',
        icon: '/icon-192x192.svg',
      });
    } catch (error) {
      console.error('订阅推送通知时出错:', error);
      console.dir(error);
      alert(`订阅失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
        console.log('已取消订阅');
      } catch (error) {
        console.error('取消订阅时出错:', error);
      }
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    browserInfo,
    subscribe,
    unsubscribe,
  };
}
