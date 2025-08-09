
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { env } from '@env.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",


    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
});



