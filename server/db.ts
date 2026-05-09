import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, serviceProviders, plans, subscriptions, conversations, messages, ratings, paymentWebhooks, InsertServiceProvider, InsertPlan, InsertSubscription, InsertConversation, InsertMessage, InsertRating, InsertPaymentWebhook } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// SERVICE PROVIDER FUNCTIONS
// ============================================================================

export async function createServiceProvider(data: InsertServiceProvider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(serviceProviders).values(data);
  return (result as any).insertId;
}

export async function getServiceProviderByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getServiceProviderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchServiceProviders(category?: string, neighborhood?: string, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(serviceProviders.isActive, true)];
  
  if (category) {
    conditions.push(eq(serviceProviders.category, category));
  }
  if (neighborhood) {
    conditions.push(eq(serviceProviders.neighborhood, neighborhood));
  }
  
  return db.select().from(serviceProviders).where(conditions.length > 1 ? and(...conditions) : conditions[0]).limit(limit).offset(offset);
}

export async function updateServiceProvider(id: number, data: Partial<InsertServiceProvider>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(serviceProviders).set(data).where(eq(serviceProviders.id, id));
}

// ============================================================================
// PLAN FUNCTIONS
// ============================================================================

export async function createPlan(data: InsertPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(plans).values(data);
  return (result as any).insertId;
}

export async function getPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPlans() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(plans);
}

// ============================================================================
// SUBSCRIPTION FUNCTIONS
// ============================================================================

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(subscriptions).values(data);
  return (result as any).insertId;
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSubscriptionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

// ============================================================================
// CONVERSATION & MESSAGE FUNCTIONS
// ============================================================================

export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(conversations).values(data);
  return (result as any).insertId;
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(conversations).where(eq(conversations.clientUserId, userId)).orderBy(desc(conversations.lastMessageAt));
}

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data);
  return (result as any).insertId;
}

export async function getConversationMessages(conversationId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(desc(messages.createdAt)).limit(limit).offset(offset);
}

// ============================================================================
// RATING FUNCTIONS
// ============================================================================

export async function createRating(data: InsertRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ratings).values(data);
  return (result as any).insertId;
}

export async function getServiceProviderRatings(serviceProviderId: number, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(ratings).where(eq(ratings.serviceProviderId, serviceProviderId)).orderBy(desc(ratings.createdAt)).limit(limit).offset(offset);
}

// ============================================================================
// PAYMENT WEBHOOK FUNCTIONS
// ============================================================================

export async function createPaymentWebhook(data: InsertPaymentWebhook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(paymentWebhooks).values(data);
  return (result as any).insertId;
}

export async function getUnprocessedWebhooks() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(paymentWebhooks).where(eq(paymentWebhooks.processed, false));
}

export async function markWebhookAsProcessed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(paymentWebhooks).set({ processed: true }).where(eq(paymentWebhooks.id, id));
}
