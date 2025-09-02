import { z } from 'zod';
import { createHash } from 'crypto';
import { publicProcedure, router } from '../trpc.js';

const subscriptionSchema = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
});

function generateEndpointHash(endpoint: string): string {
  return createHash('sha256').update(endpoint).digest('hex');
}

export const subscriptionRouter = router({
  create: publicProcedure
    .input(subscriptionSchema)
    .mutation(async ({ input, ctx }) => {
      const endpointHash = generateEndpointHash(input.endpoint);
      const subscriptionData = {
        ...input,
        endpointHash,
      };
      
      const subscription = await ctx.prisma.pushSubscription.upsert({
        where: { endpointHash },
        create: subscriptionData,
        update: subscriptionData,
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
      const endpointHash = generateEndpointHash(input.endpoint);
      return await ctx.prisma.pushSubscription.update({
        where: { endpointHash },
        data: { isActive: false },
      });
    }),
});