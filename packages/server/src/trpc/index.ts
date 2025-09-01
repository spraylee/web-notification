import { router } from './trpc.js';
import { subscriptionRouter } from './routers/subscription.js';
import { notificationRouter } from './routers/notification.js';

export const appRouter = router({
  subscription: subscriptionRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;