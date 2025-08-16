import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';
import { createTRPCContext } from '@/server/lib/context';
import { NextRequest } from 'next/server';

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers })
  });
}
export { handler as GET, handler as POST };
