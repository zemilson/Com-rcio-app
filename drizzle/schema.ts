import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Service provider profile
 * Stores information about service providers (prestadores)
 */
export const serviceProviders = mysqlTable("serviceProviders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Eletricista", "Encanador"
  description: text("description"),
  address: varchar("address", { length: 255 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  photos: json("photos").$type<string[]>().default([]), // Array of photo URLs
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: int("totalRatings").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = typeof serviceProviders.$inferInsert;

/**
 * Subscription plans
 * Defines the available plans (Básico, Profissional)
 */
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // "Básico", "Profissional"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  trialDays: int("trialDays").default(0), // 7 for Básico, 0 for Profissional
  features: json("features").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

/**
 * User subscriptions
 * Tracks subscription status and payment information
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "trial", "canceled", "paused"]).default("trial").notNull(),
  mercadoPagoSubscriptionId: varchar("mercadoPagoSubscriptionId", { length: 255 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  trialEndDate: timestamp("trialEndDate"),
  nextBillingDate: timestamp("nextBillingDate"),
  canceledAt: timestamp("canceledAt"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // "credit_card", "pix"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Conversations (Chat)
 * Stores chat conversations between clients and service providers
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  providerUserId: int("providerUserId").notNull(),
  serviceProviderId: int("serviceProviderId").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Chat messages
 * Individual messages within conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Service ratings
 * Stores ratings and reviews from clients
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  serviceProviderId: int("serviceProviderId").notNull(),
  clientUserId: int("clientUserId").notNull(),
  stars: int("stars").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Payment webhooks log
 * Logs all Mercado Pago webhook events for debugging
 */
export const paymentWebhooks = mysqlTable("paymentWebhooks", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId"),
  event: varchar("event", { length: 100 }).notNull(), // "payment.created", "subscription.updated", etc.
  payload: json("payload"), // Full webhook payload
  processed: boolean("processed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentWebhook = typeof paymentWebhooks.$inferSelect;
export type InsertPaymentWebhook = typeof paymentWebhooks.$inferInsert;
