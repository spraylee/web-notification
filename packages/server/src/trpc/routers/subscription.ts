import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';

const subscriptionSchema = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
});

export const subscriptionRouter = router({
  create: publicProcedure
    .input(subscriptionSchema)
    .mutation(async ({ input, ctx }) => {
      const subscription = await ctx.prisma.pushSubscription.upsert({
        where: { endpoint: input.endpoint },
        create: input,
        update: input,
      });
      return subscription;
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.pushSubscription.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  delete: publicProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.pushSubscription.update({
        where: { endpoint: input.endpoint },
        data: { isActive: false },
      });
    }),
});