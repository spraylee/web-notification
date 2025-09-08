import { z } from 'zod';
import { createHash } from 'crypto';
import { publicProcedure, router } from '../trpc.js';
import webpush from 'web-push';

const notificationSchema = z.object({
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  data: z.string().optional(),
});

function generateEndpointHash(endpoint: string): string {
  return createHash('sha256').update(endpoint).digest('hex');
}

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
    .input(
      notificationSchema.extend({
        endpoint: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { endpoint, ...notificationData } = input;

      const notification = await ctx.prisma.notification.create({
        data: notificationData,
      });

      let subscriptions;
      if (endpoint) {
        const endpointHash = generateEndpointHash(endpoint);
        const subscription = await ctx.prisma.pushSubscription.findUnique({
          where: { endpointHash, isActive: true },
        });
        subscriptions = subscription ? [subscription] : [];
      } else {
        subscriptions = await ctx.prisma.pushSubscription.findMany({
          where: { isActive: true },
        });
      }

      if (subscriptions.length === 0) {
        return {
          notification,
          results: [],
          totalSent: 0,
          totalFailed: 0,
        };
      }

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
        } catch (error: any) {
          console.error('Failed to send notification:', error);

          // 如果是订阅无效错误（410 Gone 或 400 Bad Request），标记为无效
          if (error.statusCode === 410 || error.statusCode === 400) {
            const endpointHash = generateEndpointHash(sub.endpoint);
            await ctx.prisma.pushSubscription.update({
              where: { endpointHash },
              data: { isActive: false }
            });
          }

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

  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }),
});
