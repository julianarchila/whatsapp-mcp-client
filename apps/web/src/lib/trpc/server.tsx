import 'server-only';
import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { cache } from 'react';
import { headers } from 'next/headers';
import { makeQueryClient } from './query-client';
import { type AppRouter } from '@/server/routers';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

// Create a stable getter for the query client
export const getQueryClient = cache(makeQueryClient);

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3001}`;
}

/**
 * Server-side tRPC client for RSC
 */
export const trpcServer = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: async () => {
        const heads = new Headers(await headers());
        heads.set("x-trpc-source", "rsc");
        return Object.fromEntries(heads.entries());
      },
    }),
  ],
});

/**
 * Client-side tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Hydration boundary for SSR
 */
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

/**
 * Helper function to prefetch data on server
 * Usage: await prefetchData('posts.getAll', { limit: 10 })
 */
export async function prefetchData(
  queryKey: string[],
  queryFn: () => Promise<any>
) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}
