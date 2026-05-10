import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getAllOffers, getTrialSession, getActiveSubscription } from "./db";

export const offersRouter = router({
  // Get all offers with access control
  list: publicProcedure.query(async ({ ctx }) => {
    const offers = await getAllOffers();

    // If user is not authenticated, return offers without prices
    if (!ctx.user) {
      return offers.map((offer) => ({
        ...offer,
        price: null,
        originalPrice: null,
        isPreview: true,
      }));
    }

    // Check if user has trial or active subscription
    const trial = await getTrialSession(ctx.user.id);
    const subscription = await getActiveSubscription(ctx.user.id);

    const hasAccess =
      (trial && new Date(trial.endDate) > new Date()) || !!subscription;

    // If user doesn't have access, return offers without prices
    if (!hasAccess) {
      return offers.map((offer) => ({
        ...offer,
        price: null,
        originalPrice: null,
        isPreview: true,
      }));
    }

    // User has access, return full offers
    return offers.map((offer) => ({
      ...offer,
      isPreview: false,
    }));
  }),

  // Get single offer with access control
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const offers = await getAllOffers();
      const offer = offers.find((o) => o.id === input.id);

      if (!offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Oferta não encontrada",
        });
      }

      // If user is not authenticated, return offer without price
      if (!ctx.user) {
        return {
          ...offer,
          price: null,
          originalPrice: null,
          isPreview: true,
        };
      }

      // Check if user has trial or active subscription
      const trial = await getTrialSession(ctx.user.id);
      const subscription = await getActiveSubscription(ctx.user.id);

      const hasAccess =
        (trial && new Date(trial.endDate) > new Date()) || !!subscription;

      // If user doesn't have access, return offer without price
      if (!hasAccess) {
        return {
          ...offer,
          price: null,
          originalPrice: null,
          isPreview: true,
        };
      }

      // User has access, return full offer
      return {
        ...offer,
        isPreview: false,
      };
    }),

  // Get comparison data for offer (only for authenticated users with access)
  getComparison: protectedProcedure
    .input(z.object({ offerId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Você precisa estar autenticado",
        });
      }

      // Check if user has trial or active subscription
      const trial = await getTrialSession(ctx.user.id);
      const subscription = await getActiveSubscription(ctx.user.id);

      const hasAccess =
        (trial && new Date(trial.endDate) > new Date()) || !!subscription;

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você precisa de uma assinatura ativa para acessar o comparador",
        });
      }

      const offers = await getAllOffers();
      const offer = offers.find((o) => o.id === input.offerId);

      if (!offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Oferta não encontrada",
        });
      }

      // Return comparison data
      return {
        offer,
        comparison: [
          {
            store: offer.source,
            price: offer.price,
            url: offer.originalUrl,
            isBest: true,
          },
          // Placeholder for other stores
        ],
      };
    }),
});
