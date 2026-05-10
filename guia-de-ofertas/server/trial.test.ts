import { describe, expect, it } from "vitest";
import { getOrCreateTrialSession, getTrialSession, isTrialActive } from "./db";
import { generateDeviceId, isValidDeviceId } from "./deviceId";

describe("Trial System", () => {
  describe("Device ID Generation", () => {
    it("should generate a valid device ID", () => {
      const deviceId = generateDeviceId();
      expect(isValidDeviceId(deviceId)).toBe(true);
    });

    it("should generate unique device IDs", () => {
      const id1 = generateDeviceId();
      const id2 = generateDeviceId();
      expect(id1).not.toBe(id2);
    });

    it("should validate device ID format", () => {
      expect(isValidDeviceId("invalid")).toBe(false);
      expect(isValidDeviceId("a".repeat(64))).toBe(true);
    });
  });

  describe("Trial Session Management", () => {
    it("should create a trial session with 7 day expiration", async () => {
      const userId = 1;
      const deviceId = generateDeviceId();
      
      const trial = await getOrCreateTrialSession(userId, deviceId);
      
      expect(trial).toBeDefined();
      expect(trial?.userId).toBe(userId);
      expect(trial?.isActive).toBe(true);
      expect(trial?.endDate).toBeDefined();
    });

    it("should return existing trial session if already created", async () => {
      const userId = 2;
      const deviceId = generateDeviceId();
      
      const trial1 = await getOrCreateTrialSession(userId, deviceId);
      const trial2 = await getOrCreateTrialSession(userId, deviceId);
      
      expect(trial1?.userId).toBe(trial2?.userId);
      expect(trial1?.isActive).toBe(trial2?.isActive);
    });

    it("should retrieve trial session by user ID", async () => {
      const userId = 3;
      const deviceId = generateDeviceId();
      
      await getOrCreateTrialSession(userId, deviceId);
      const trial = await getTrialSession(userId);
      
      expect(trial).toBeDefined();
      expect(trial?.userId).toBe(userId);
      expect(trial?.isActive).toBe(true);
    });

    it("should check if trial is active", async () => {
      const userId = 4;
      const deviceId = generateDeviceId();
      
      const trial = await getOrCreateTrialSession(userId, deviceId);
      const active = await isTrialActive(userId);
      
      expect(active).toBe(true);
      expect(trial?.isActive).toBe(true);
    });

    it("should return false for non-existent trial", async () => {
      const active = await isTrialActive(999);
      expect(active).toBe(false);
    });
  });

  describe("Trial Expiration", () => {
    it("should calculate remaining days correctly", async () => {
      const userId = 5;
      const deviceId = generateDeviceId();
      
      const trial = await getOrCreateTrialSession(userId, deviceId);
      
      if (trial?.endDate) {
        const now = new Date();
        const endDate = new Date(trial.endDate);
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        expect(daysRemaining).toBeGreaterThanOrEqual(6);
        expect(daysRemaining).toBeLessThanOrEqual(8);
      } else {
        throw new Error("Trial endDate is not defined");
      }
    });
  });
});
