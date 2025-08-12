import type { NextRequest } from "next/server";
import { auth } from "./auth";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });
  return {
    session,
  };
}


export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
