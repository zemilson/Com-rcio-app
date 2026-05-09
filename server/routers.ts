import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Service Provider Routes
  serviceProviders: router({
    search: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        neighborhood: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(({ input }) =>
        db.searchServiceProviders(input.category, input.neighborhood, input.limit, input.offset)
      ),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getServiceProviderById(input.id)),

    getByUserId: protectedProcedure
      .query(({ ctx }) => db.getServiceProviderByUserId(ctx.user.id)),

    create: protectedProcedure
      .input(z.object({
        category: z.string(),
        description: z.string().optional(),
        address: z.string(),
        neighborhood: z.string(),
        whatsapp: z.string(),
        photos: z.array(z.string()).default([]),
      }))
      .mutation(({ ctx, input }) =>
        db.createServiceProvider({
          userId: ctx.user.id,
          ...input,
        })
      ),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        category: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        neighborhood: z.string().optional(),
        whatsapp: z.string().optional(),
        photos: z.array(z.string()).optional(),
      }))
      .mutation(({ input }) => db.updateServiceProvider(input.id, input)),
  }),

  // Plans Routes
  plans: router({
    list: publicProcedure.query(() => db.getAllPlans()),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPlanById(input.id)),
  }),

  // Subscription Routes
  subscriptions: router({
    getCurrent: protectedProcedure
      .query(({ ctx }) => db.getSubscriptionByUserId(ctx.user.id)),

    create: protectedProcedure
      .input(z.object({
        planId: z.number(),
        paymentMethod: z.enum(["credit_card", "pix"]),
      }))
      .mutation(({ ctx, input }) =>
        db.createSubscription({
          userId: ctx.user.id,
          planId: input.planId,
          paymentMethod: input.paymentMethod,
          status: "trial",
        })
      ),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "trial", "canceled", "paused"]).optional(),
        mercadoPagoSubscriptionId: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateSubscription(input.id, input)),
  }),

  // Chat Routes
  conversations: router({
    list: protectedProcedure
      .query(({ ctx }) => db.getUserConversations(ctx.user.id)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getConversationById(input.id)),

    create: protectedProcedure
      .input(z.object({
        providerUserId: z.number(),
        serviceProviderId: z.number(),
      }))
      .mutation(({ ctx, input }) =>
        db.createConversation({
          clientUserId: ctx.user.id,
          providerUserId: input.providerUserId,
          serviceProviderId: input.serviceProviderId,
        })
      ),
  }),

  messages: router({
    getConversationMessages: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(({ input }) =>
        db.getConversationMessages(input.conversationId, input.limit, input.offset)
      ),

    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
      }))
      .mutation(({ ctx, input }) =>
        db.createMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
        })
      ),
  }),

  // Rating Routes
  ratings: router({
    getServiceProviderRatings: publicProcedure
      .input(z.object({
        serviceProviderId: z.number(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      }))
      .query(({ input }) =>
        db.getServiceProviderRatings(input.serviceProviderId, input.limit, input.offset)
      ),

    create: protectedProcedure
      .input(z.object({
        serviceProviderId: z.number(),
        stars: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(({ ctx, input }) =>
        db.createRating({
          serviceProviderId: input.serviceProviderId,
          clientUserId: ctx.user.id,
          stars: input.stars,
          comment: input.comment,
        })
      ),
  }),
});

export type AppRouter = typeof appRouter;
