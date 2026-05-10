import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, longtext, datetime } from "drizzle-orm/mysql-core";

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
  deviceId: varchar("deviceId", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Trial sessions table - tracks free trial period per user/device
export const trialSessions = mysqlTable("trial_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceId: varchar("deviceId", { length: 255 }).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrialSession = typeof trialSessions.$inferSelect;
export type InsertTrialSession = typeof trialSessions.$inferInsert;

// Subscriptions table - tracks paid subscriptions
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planType: mysqlEnum("planType", ["monthly", "annual"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  mercadoPagoId: varchar("mercadoPagoId", { length: 255 }),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Admin configuration table - stores URL and parser settings
export const adminConfig = mysqlTable("admin_config", {
  id: int("id").autoincrement().primaryKey(),
  sourceUrl: text("sourceUrl").notNull(),
  parserType: mysqlEnum("parserType", ["json", "rss", "html", "csv"]).notNull(),
  cssSelector: text("cssSelector"),
  isActive: boolean("isActive").default(true).notNull(),
  lastClonedAt: timestamp("lastClonedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminConfig = typeof adminConfig.$inferSelect;
export type InsertAdminConfig = typeof adminConfig.$inferInsert;

// Offers table - stores cloned offers
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: longtext("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  image: text("image"),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: text("sourceUrl"),
  originalUrl: text("originalUrl"),
  expiresAt: timestamp("expiresAt"),
  clonedAt: timestamp("clonedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

// Clone history table - tracks all cloning operations
export const cloneHistory = mysqlTable("clone_history", {
  id: int("id").autoincrement().primaryKey(),
  sourceUrl: text("sourceUrl").notNull(),
  parserType: mysqlEnum("parserType", ["json", "rss", "html", "csv"]).notNull(),
  offersCount: int("offersCount").notNull(),
  status: mysqlEnum("status", ["success", "error"]).notNull(),
  errorMessage: text("errorMessage"),
  clonedAt: timestamp("clonedAt").defaultNow().notNull(),
});

export type CloneHistory = typeof cloneHistory.$inferSelect;
export type InsertCloneHistory = typeof cloneHistory.$inferInsert;

// Price comparisons table - stores price comparisons for offers
export const priceComparisons = mysqlTable("price_comparisons", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").notNull(),
  store: varchar("store", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  url: text("url"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PriceComparison = typeof priceComparisons.$inferSelect;
export type InsertPriceComparison = typeof priceComparisons.$inferInsert;