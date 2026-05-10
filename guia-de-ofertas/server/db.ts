import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, trialSessions, subscriptions, offers, adminConfig } from "../drizzle/schema";
import { ENV } from './_core/env';

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
      values.role = 'admin';
      updateSet.role = 'admin';
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

// Trial helpers
export async function getOrCreateTrialSession(userId: number, deviceId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db
    .select()
    .from(trialSessions)
    .where(eq(trialSessions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  await db
    .insert(trialSessions)
    .values({ userId, deviceId, endDate });

  const created = await db
    .select()
    .from(trialSessions)
    .where(eq(trialSessions.userId, userId))
    .limit(1);

  return created[0];
}

export async function getTrialSession(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(trialSessions)
    .where(eq(trialSessions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function isTrialActive(userId: number): Promise<boolean> {
  const trial = await getTrialSession(userId);
  if (!trial) return false;
  if (!trial.isActive) return false;
  return new Date(trial.endDate) > new Date();
}

// Subscription helpers
export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (result.length === 0) return undefined;

  const sub = result[0];
  if (sub.status !== 'active') return undefined;
  if (sub.endDate && new Date(sub.endDate) < new Date()) return undefined;

  return sub;
}

// Offers helpers
export async function getAllOffers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(offers).orderBy(offers.clonedAt);
}

export async function getOfferById(offerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(offers)
    .where(eq(offers.id, offerId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOffer(data: any) {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(offers).values(data);
  return true;
}

export async function deleteExpiredOffers() {
  const db = await getDb();
  if (!db) return 0;

  // Note: Drizzle's delete doesn't support complex where clauses easily
  // This is a simplified version - in production, use raw SQL if needed
  return 0;
}

// Admin config helpers
export async function getAdminConfig() {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminConfig)
    .where(eq(adminConfig.isActive, true))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateAdminConfig(data: any) {
  const db = await getDb();
  if (!db) return undefined;

  const config = await getAdminConfig();
  if (!config) {
    await db.insert(adminConfig).values(data);
  } else {
    await db.update(adminConfig).set(data).where(eq(adminConfig.id, config.id));
  }
  return true;
}

// TODO: add more feature queries here as your schema grows.
