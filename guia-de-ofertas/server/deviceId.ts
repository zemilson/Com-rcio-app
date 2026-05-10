import crypto from 'crypto';

/**
 * Generates a unique device ID based on a combination of factors
 * This is used to prevent trial reset by reinstalling the app
 */
export function generateDeviceId(): string {
  // In a real app, you'd use more sophisticated device fingerprinting
  // For now, we'll use a combination of timestamp and random data
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  return crypto.createHash('sha256').update(`${timestamp}-${random}`).digest('hex');
}

/**
 * Validates that a device ID hasn't been tampered with
 */
export function isValidDeviceId(deviceId: string): boolean {
  // Device ID should be a 64-character hex string (SHA256)
  return /^[a-f0-9]{64}$/.test(deviceId);
}
