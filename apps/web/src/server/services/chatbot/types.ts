export type ChatbotErrorType = 
  | 'CONVERSATION_LOOKUP_FAILED' 
  | 'CONVERSATION_CREATION_FAILED' 
  | 'MESSAGE_SAVE_FAILED' 
  | 'AI_GENERATION_FAILED' 
  | 'INVALID_USER_ID'
  | 'INVALID_MESSAGE';

export class ChatbotError extends Error {
  constructor(public readonly type: ChatbotErrorType, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ChatbotError';
  }
}

export type MessageKind = 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';

export interface MediaAttachment {
  url: string;
  contentType: string;
}

export interface LocationAttachment {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DomainMessage {
  kind: MessageKind;
  from: string;
  to: string;
  text?: string;
  media?: MediaAttachment[];
  location?: LocationAttachment;
  raw?: unknown;
}


