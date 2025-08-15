import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { TRPCError } from "@trpc/server";

if (!process.env.POSTGRES_URL) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "POSTGRES_URL is not set" });
}

const client = postgres(process.env.POSTGRES_URL);
export const db = drizzle(client);
