import type { DomainMessage } from './types';

// Compose the final user text from text + any enriched fields.
// Currently, no-op additions to preserve behavior.
export const composeUserText = (message: DomainMessage): string => {
  return (message.text || '').toString();
};


