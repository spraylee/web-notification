import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc-client';
import type { PushSubscriptionData } from '../types';

const VAPID_PUBLIC_KEY = 'BOSJUkRWhT0SI7gGN8CqZV3pi48voHpkQ1qdGeYm1ndAdm50u7dChXS_l7d4qFyYh0P9_7-YEcz7XJ1mDSCMmOM';

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

  const createSubscription = trpc.subscription.create.useMutation();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      
      navigator.serviceWorker.ready.then((registration) => {
        return registration.pushManager.getSubscription();
      }).then((sub) => {
        setSubscription(sub);
        setIsSubscribed(!!sub);
      });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: sub.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
      };

      await createSubscription.mutateAsync(subscriptionData);
      
      setSubscription(sub);
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
  };
}