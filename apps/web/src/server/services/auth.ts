import { db } from "../db";
import { user } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import { Result, ok, err, ResultAsync, fromThrowable } from "neverthrow";

// Error types for auth operations
type AuthErrorType = 'USER_CREATION_FAILED' | 'USER_LOOKUP_FAILED' | 'INVALID_PHONE_NUMBER';
export class AuthError extends Error {
  constructor(public readonly type: AuthErrorType, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AuthError';
  }
}


// User type from schema
type User = typeof user.$inferSelect;
type NewUser = typeof user.$inferInsert;

/**
 * Normalize WhatsApp phone number from Twilio webhook
 * Converts "whatsapp:+1234567890" to "+1234567890"
 */
export function normalizeWhatsAppPhoneNumber(twilioPhoneNumber: string): string {
  return twilioPhoneNumber.replace(/^whatsapp:/, '');
}

/**
 * Validate phone number format
 */
const validatePhoneNumber = (phoneNumber: string) => {
  const normalized = normalizeWhatsAppPhoneNumber(phoneNumber);
  
  // Basic validation - should start with + and contain only digits
  if (!normalized.match(/^\+[1-9]\d{1,14}$/)) {
    return err(new AuthError('INVALID_PHONE_NUMBER', `Invalid phone number format: ${phoneNumber}`));
  }
  
  return ok(normalized);
};

/**
 * Find existing user by phone number using ResultAsync
 */
const findUserByPhoneNumber = (phoneNumber: string) =>
  ResultAsync.fromPromise(
    db.select()
      .from(user)
      .where(eq(user.phoneNumber, phoneNumber))
      .limit(1),
    (error) => new AuthError('USER_LOOKUP_FAILED', 'Failed to lookup user by phone number', error)
  ).map((results) => results[0] || null);

/**
 * Create a new user from WhatsApp phone number using ResultAsync
 */
const createUserFromWhatsApp = (phoneNumber: string) => {
  // Generate a unique user ID
  const userId = `whatsapp_${phoneNumber.replace(/[^0-9]/g, '')}_${Date.now()}`;
  
  return ResultAsync.fromPromise(
    db.insert(user)
      .values({
        id: userId,
        name: phoneNumber, // Use phone number as default name
        phoneNumber,
        phoneNumberVerified: true, // Assume verified since they're messaging via WhatsApp
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning(),
    (error) => new AuthError('USER_CREATION_FAILED', 'Failed to create user from WhatsApp phone number', error)
  ).map((results) => results[0]);
};

/**
 * Get or create user from WhatsApp phone number
 * This is the main function to use in webhook handlers
 */
export const getOrCreateWhatsAppUser = async (twilioPhoneNumber: string) => {
  console.log(`🔍 Looking up user for WhatsApp number: ${twilioPhoneNumber}`);
  
  // Validate and normalize phone number
  const phoneResult = validatePhoneNumber(twilioPhoneNumber);
  if (phoneResult.isErr()) {
    return err(phoneResult.error);
  }
  
  const phoneNumber = phoneResult.value;
  
  const findResult = await findUserByPhoneNumber(phoneNumber);
  if (findResult.isErr()) {
    return err(findResult.error);
  }
  
  const existingUser = findResult.value;
  if (existingUser) {
    console.log(`✅ Found existing user: ${existingUser.id} (${existingUser.name})`);
    return ok(existingUser);
  }
  
  // Create new user if none exists
  console.log(`👤 Creating new user for phone number: ${phoneNumber}`);
  const createResult = await createUserFromWhatsApp(phoneNumber);
  
  if (createResult.isErr()) {
    console.error(`❌ Failed to create user: ${createResult.error.message}`);
    return err(createResult.error);
  }
  
  const newUser = createResult.value;
  console.log(`✅ Created new user: ${newUser.id} (${newUser.name})`);
  return ok(newUser);
};

// Export types
export type { User };
