
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { phoneNumber } from "better-auth/plugins";
import { sendOTP } from "./sms";
import { env } from '@env';

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
      const result = await sendOTP(phoneNumber, code);
      if (result.isErr()) {
        console.error('Failed to send OTP:', result.error);
        // Convert to Error for better-auth compatibility
        const error = new Error(result.error.message);
        error.cause = result.error.cause;
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
  secret: env.BETTER_AUTH_SECRET,
});



