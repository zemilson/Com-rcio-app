import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getOrCreateTrialSession, getTrialSession, isTrialActive, getActiveSubscription, getAllOffers, getAdminConfig } from "./db";
import { generateDeviceId } from "./deviceId";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminRouter } from "./adminRouter";
import { subscriptionRouter } from "./subscriptionRouter";
import { offersRouter } from "./offersRouter";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Trial and subscription routers
  trial: router({
    initializeTrial: protectedProcedure
      .input(z.object({ deviceId: z.string().optional() }).optional())
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const deviceId = input?.deviceId || generateDeviceId();
        const trial = await getOrCreateTrialSession(ctx.user.id, deviceId);
        
        return {
          trial,
          deviceId,
        };
      }),
    
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      
      const trial = await getTrialSession(ctx.user.id);
      const subscription = await getActiveSubscription(ctx.user.id);
      const isTrialActiveNow = trial && new Date(trial.endDate) > new Date();
      
      return {
        hasActiveTrial: !!isTrialActiveNow,
        hasActiveSubscription: !!subscription,
        trial,
        subscription,
        daysRemaining: trial ? Math.ceil((new Date(trial.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
      };
    }),
  }),

  // Offers router with access control
  offers: offersRouter,

  // Admin router
  admin: adminRouter,

  // Subscription router
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
