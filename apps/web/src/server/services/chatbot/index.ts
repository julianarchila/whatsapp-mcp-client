import type { DomainMessage } from './types';
import { runChatbot } from './core';
import { getOrCreateWhatsAppUser } from '../auth';
import { err } from 'neverthrow';

export const processMessage = async (domainMessage: DomainMessage) => {
    const userResult = await getOrCreateWhatsAppUser(domainMessage.from)
    if (userResult.isErr()) return err(userResult.error);

  return runChatbot(userResult.value.id, domainMessage);
};

export type { DomainMessage } from './types';

