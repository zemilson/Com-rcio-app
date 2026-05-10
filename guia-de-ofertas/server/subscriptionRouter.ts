import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createPaymentPreference, getAllPlans } from "./mercadopago";
import { getActiveSubscription } from "./db";

export const subscriptionRouter = router({
  // Get all available plans
  getPlans: publicProcedure.query(async () => {
    return getAllPlans();
  }),

  // Create payment preference for subscription
  createCheckout: protectedProcedure
    .input(
      z.object({
        planType: z.enum(["monthly", "annual"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const preference = await createPaymentPreference(
          input.planType,
          ctx.user.id,
          ctx.user.email || "unknown@example.com"
        );

        return {
          success: true,
          checkoutUrl: preference.init_point,
          sandboxUrl: preference.sandbox_init_point,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao criar checkout: ${error}`,
        });
      }
    }),

  // Get current subscription status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const subscription = await getActiveSubscription(ctx.user.id);

    return {
      hasActiveSubscription: !!subscription,
      subscription: subscription || null,
    };
  }),
});
