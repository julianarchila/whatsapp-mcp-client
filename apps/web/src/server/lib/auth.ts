
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { phoneNumber } from "better-auth/plugins";

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
      // For now, just log the OTP code to console for testing
      console.log(`📱 OTP for ${phoneNumber}: ${code}`);
      console.log("=".repeat(50));
      console.log(`Phone: ${phoneNumber}`);
      console.log(`Code:  ${code}`);
      console.log("=".repeat(50));
      
      // You can set up Twilio or other SMS providers later
      return Promise.resolve();
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



