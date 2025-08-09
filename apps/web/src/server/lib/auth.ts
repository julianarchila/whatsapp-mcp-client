
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { phoneNumber } from "better-auth/plugins";
import { smsService } from "./sms";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: false, // Disable email/password auth
  },
  plugins: [phoneNumber({
    sendOTP: async ({ phoneNumber, code }) => {
      try {
        await smsService.sendOTP(phoneNumber, code);
      } catch (error) {
        console.error('Failed to send OTP:', error);
        // Re-throw to let better-auth handle the error appropriately
        throw error;
      }
    },
    signUpOnVerification: {
      getTempEmail: (phoneNumber) => `${phoneNumber}@temp.local`,
      getTempName: (phoneNumber) => phoneNumber,
    },
    // Configure OTP settings
    otpLength: 6,
    expiresIn: 300, // 5 minutes
  })],
  secret: process.env.BETTER_AUTH_SECRET,
});



