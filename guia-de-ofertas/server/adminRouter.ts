import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { parseOffers } from "./parsers";
import { getAdminConfig, updateAdminConfig, createOffer } from "./db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // TODO: Use proper auth

export const adminRouter = router({
  // Test clone without saving
  testClone: protectedProcedure
    .input(
      z.object({
        sourceUrl: z.string().url(),
        parserType: z.enum(["json", "rss", "html", "csv"]),
        cssSelector: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const offers = await parseOffers(input.sourceUrl, input.parserType, {
          title: input.cssSelector,
        });

        return {
          success: true,
          offersCount: offers.length,
          preview: offers.slice(0, 5),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao clonar: ${error}`,
        });
      }
    }),

  // Save and apply configuration
  saveConfig: protectedProcedure
    .input(
      z.object({
        sourceUrl: z.string().url(),
        parserType: z.enum(["json", "rss", "html", "csv"]),
        cssSelector: z.string().optional(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin password
      if (input.password !== ADMIN_PASSWORD) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha de admin incorreta",
        });
      }

      try {
        // Parse and clone offers
        const offers = await parseOffers(input.sourceUrl, input.parserType, {
          title: input.cssSelector,
        });

        // Save offers to database
        for (const offer of offers) {
          await createOffer({
            title: offer.title,
            description: offer.description,
            price: offer.price,
            originalPrice: offer.originalPrice,
            image: offer.image,
            source: offer.source,
            sourceUrl: offer.sourceUrl,
            originalUrl: offer.originalUrl,
            expiresAt: offer.expiresAt,
          });
        }

        // Update admin config
        await updateAdminConfig({
          sourceUrl: input.sourceUrl,
          parserType: input.parserType,
          cssSelector: input.cssSelector,
          lastClonedAt: new Date(),
        });

        return {
          success: true,
          offersCount: offers.length,
          message: `${offers.length} ofertas clonadas com sucesso`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao salvar e aplicar: ${error}`,
        });
      }
    }),

  // Get current admin configuration
  getConfig: protectedProcedure.query(async () => {
    const config = await getAdminConfig();
    return config || null;
  }),
});
