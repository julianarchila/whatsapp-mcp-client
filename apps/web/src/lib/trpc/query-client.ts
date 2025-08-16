import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import superjson from 'superjson';
import type {
  DehydrateOptions,
  HydrateOptions,
} from '@tanstack/react-query';

export const dehydrateOptions: DehydrateOptions = {
  // Uncomment if/when you want structured serialization:
  // serializeData: superjson.serialize,
  shouldDehydrateQuery: (query) =>
    defaultShouldDehydrateQuery(query) ||
    query.state.status === 'pending',
};

export const hydrateOptions: HydrateOptions = {
  // Uncomment if/when you enable serialization above:
  // deserializeData: superjson.deserialize,
};

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
    },
  });
}