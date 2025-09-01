import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';
import webpush from 'web-push';

const notificationSchema = z.object({
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  data: z.string().optional(),
});

export const notificationRouter = router({
  create: publicProcedure
    .input(notificationSchema)
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.notification.create({
        data: input,
      });
      return notification;
    }),

  send: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const subscriptions = await ctx.prisma.pushSubscription.findMany({
        where: { isActive: true },
      });

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        data: notification.data,
      });

      // 配置 VAPID
      webpush.setVapidDetails(
        'mailto:test@example.com',
        process.env.VAPID_PUBLIC_KEY || '',
        process.env.VAPID_PRIVATE_KEY || ''
      );

      const sendPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error('Failed to send notification:', error);
          return { success: false, endpoint: sub.endpoint, error };
        }
      });

      const results = await Promise.all(sendPromises);

      await ctx.prisma.notification.update({
        where: { id: input.id },
        data: { sent: true, sentAt: new Date() },
      });

      return { results, totalSent: results.filter(r => r.success).length };
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }),

  sendToAll: publicProcedure
    .input(notificationSchema)
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.notification.create({
        data: input,
      });

      const subscriptions = await ctx.prisma.pushSubscription.findMany({
        where: { isActive: true },
      });

      const payload = JSON.stringify({
        title: input.title,
        body: input.body,
        icon: input.icon,
        badge: input.badge,
        data: input.data,
      });

      // 配置 VAPID
      webpush.setVapidDetails(
        'mailto:test@example.com',
        process.env.VAPID_PUBLIC_KEY || '',
        process.env.VAPID_PRIVATE_KEY || ''
      );

      const sendPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error('Failed to send notification:', error);
          return { success: false, endpoint: sub.endpoint, error };
        }
      });

      const results = await Promise.all(sendPromises);

      await ctx.prisma.notification.update({
        where: { id: notification.id },
        data: { sent: true, sentAt: new Date() },
      });

      return { 
        notification,
        results, 
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length
      };
    }),
});