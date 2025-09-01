export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: string;
}