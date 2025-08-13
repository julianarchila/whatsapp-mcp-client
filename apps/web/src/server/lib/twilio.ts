import twilio from 'twilio';
import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';
import { env } from '@env';

// Base Twilio webhook schema with all standard parameters
const TwilioBaseSchema = z.object({
  // Core identifiers (required for all messages)
  MessageSid: z.string().min(34).max(34), // 34 character unique identifier
  SmsSid: z.string().optional(), // Deprecated, same as MessageSid
  SmsMessageSid: z.string().optional(), // Deprecated, same as MessageSid
  AccountSid: z.string().min(34).max(34), // 34 character account id
  MessagingServiceSid: z.string().optional(), // 34 character messaging service id
  
  // Message routing
  From: z.string(), // Phone number or channel address that sent the message
  To: z.string(), // Phone number or channel address of recipient
  
  // Message content
  Body: z.string().optional(), // Text body, up to 1600 characters
  NumMedia: z.string().optional().default('0'), // Number of media items
  NumSegments: z.string().optional().default('1'), // Number of message segments
  
  // Geographic data (optional, based on phone number lookup)
  FromCity: z.string().optional(),
  FromState: z.string().optional(),
  FromZip: z.string().optional(),
  FromCountry: z.string().optional(),
  ToCity: z.string().optional(),
  ToState: z.string().optional(),
  ToZip: z.string().optional(),
  ToCountry: z.string().optional(),
  
  // API metadata
  ApiVersion: z.string().optional(),
}).catchall(z.string().optional()); // Allow additional parameters as Twilio may add new ones

// Media parameters schema (dynamic MediaUrl0, MediaContentType0, etc.)
const MediaParametersSchema = z.object({}).catchall(z.string().optional());

// WhatsApp-specific parameters
const WhatsAppParametersSchema = z.object({
  // WhatsApp profile information
  ProfileName: z.string().optional(), // Sender's WhatsApp profile name
  WaId: z.string().optional(), // Sender's WhatsApp ID (typically phone number)
  
  // Message forwarding status
  Forwarded: z.string().optional(), // "true" if message has been forwarded once
  FrequentlyForwarded: z.string().optional(), // "true" if frequently forwarded
  
  // Quick reply buttons
  ButtonText: z.string().optional(), // Text of Quick reply button
  
  // Location sharing (for WhatsApp location messages)
  Latitude: z.string().optional(), // Latitude value of shared location
  Longitude: z.string().optional(), // Longitude value of shared location
  Address: z.string().optional(), // Address of shared location
  Label: z.string().optional(), // Label or name of shared location
  
  // Reply context (for replies to previous messages)
  OriginalRepliedMessageSender: z.string().optional(), // Sender of original message
  OriginalRepliedMessageSid: z.string().optional(), // SID of original message
  
  // Click-to-WhatsApp advertisement parameters
  ReferralBody: z.string().optional(), // Body text of the advertisement
  ReferralHeadline: z.string().optional(), // Headline text of the advertisement
  ReferralSourceId: z.string().optional(), // Meta/WhatsApp's ID of the advertisement
  ReferralSourceType: z.string().optional(), // Type of the advertisement (e.g., "post")
  ReferralSourceUrl: z.string().optional(), // URL referencing advertisement content
  ReferralMediaId: z.string().optional(), // Meta/WhatsApp's ID of advertisement media
  ReferralMediaContentType: z.string().optional(), // Media ContentType of advertisement
  ReferralMediaUrl: z.string().optional(), // URL referencing advertisement media
  ReferralNumMedia: z.string().optional(), // Number of media items in advertisement
  ReferralCtwaClid: z.string().optional(), // Click to WhatsApp advertisement ID
  
  // Legacy/internal fields
  ChannelPrefix: z.literal('whatsapp').optional(),
  ChannelInstallSid: z.string().optional(),
  ChannelToAddress: z.string().optional(),
  StructuredMessage: z.string().optional(),
}).catchall(z.string().optional());

// Combined schemas for different webhook types
const TwilioIncomingMessageSchema = TwilioBaseSchema
  .extend(MediaParametersSchema.shape)
  .extend(WhatsAppParametersSchema.shape)
  .extend({
    Body: z.string().min(1), // Incoming messages must have content
  });

const TwilioStatusCallbackSchema = TwilioBaseSchema
  .extend(MediaParametersSchema.shape)
  .extend(WhatsAppParametersSchema.shape)
  .extend({
    MessageStatus: z.string().optional(), // Status of the message
    SmsStatus: z.string().optional(), // Legacy status field
  });

// Union type for webhook validation
const TwilioWebhookSchema = z.union([
  TwilioIncomingMessageSchema,
  TwilioStatusCallbackSchema,
]);

// Inferred types
export type TwilioIncomingMessage = z.infer<typeof TwilioIncomingMessageSchema>;
export type TwilioStatusCallback = z.infer<typeof TwilioStatusCallbackSchema>;
export type TwilioWebhook = z.infer<typeof TwilioWebhookSchema>;

// Webhook type discriminator
export type TwilioWebhookType = 'incoming_message' | 'status_callback' | 'unknown';

/**
 * Determine general Twilio webhook type
 */
const determineTwilioWebhookType = (data: any): TwilioWebhookType => {
  // Log the data for debugging
  console.log('🔍 Twilio webhook type detection:', {
    hasBody: !!data.Body,
    hasMessageStatus: !!data.MessageStatus,
    hasSmsStatus: !!data.SmsStatus,
    bodyLength: data.Body?.length || 0,
    from: data.From,
    to: data.To,
  });
  
  // Incoming messages have Body field with content (prioritize this check)
  if (data.Body && data.Body.trim().length > 0) {
    return 'incoming_message';
  }
  
  // Status callbacks have status fields OR no meaningful body
  if (data.MessageStatus || data.SmsStatus || !data.Body || data.Body.trim().length === 0) {
    return 'status_callback';
  }
  
  return 'unknown';
};



/**
 * Validate Twilio webhook signature
 */
export const validateTwilioSignature = (
  params: Record<string, any>,
  signature: string,
  url: string
) => {
  const isValid = twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, url, params);
  return isValid ?? false;
};

/**
 * Get the actual URL for signature validation
 */
export const getWebhookUrl = (request: Request) => {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');
  
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}/api/webhooks/twilio`;
  }
  
  if (host) {
    return `https://${host}/api/webhooks/twilio`;
  }
  
  return new URL(request.url).href;
};

/**
 * Parse and validate general Twilio webhook
 */
export const parseTwilioWebhook = async (request: Request) => {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return err('Failed to parse form data');
  }
  
  const rawData = Object.fromEntries(formData.entries());
  const webhookType = determineTwilioWebhookType(rawData);
  
  if (webhookType === 'unknown') {
    return err(`Unknown Twilio webhook type. Data: ${JSON.stringify(rawData)}`);
  }
  
  const schema = webhookType === 'incoming_message' 
    ? TwilioIncomingMessageSchema 
    : TwilioStatusCallbackSchema;
    
  const validationResult = schema.safeParse(rawData);
  
  if (!validationResult.success) {
    return err(`Invalid Twilio ${webhookType} webhook: ${validationResult.error.message}`);
  }
  
  return ok({
    type: webhookType,
    data: validationResult.data,
    rawData,
  });
};

/**
 * Create TwiML response
 */
export const createTwiMLResponse = (message: string) => {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  
  return new Response(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
};

/**
 * Check if webhook is from WhatsApp channel
 */
export const isWhatsAppWebhook = (data: any): boolean => {
  return data.From?.startsWith('whatsapp:') && data.To?.startsWith('whatsapp:');
};

/**
 * Extract media URLs from webhook data
 * Handles dynamic MediaUrl0, MediaUrl1, etc. parameters
 */
export const extractMediaUrls = (data: any): string[] => {
  const mediaUrls: string[] = [];
  const numMedia = parseInt(data.NumMedia || '0', 10);
  
  for (let i = 0; i < numMedia; i++) {
    const mediaUrl = data[`MediaUrl${i}`];
    if (mediaUrl) {
      mediaUrls.push(mediaUrl);
    }
  }
  
  return mediaUrls;
};

/**
 * Extract media content types from webhook data
 * Handles dynamic MediaContentType0, MediaContentType1, etc. parameters
 */
export const extractMediaContentTypes = (data: any): string[] => {
  const contentTypes: string[] = [];
  const numMedia = parseInt(data.NumMedia || '0', 10);
  
  for (let i = 0; i < numMedia; i++) {
    const contentType = data[`MediaContentType${i}`];
    if (contentType) {
      contentTypes.push(contentType);
    }
  }
  
  return contentTypes;
};

/**
 * Check if webhook contains location data
 */
export const hasLocationData = (data: any): boolean => {
  return !!(data.Latitude && data.Longitude);
};

/**
 * Check if webhook is a reply to a previous message
 */
export const isReplyMessage = (data: any): boolean => {
  return !!(data.OriginalRepliedMessageSid && data.OriginalRepliedMessageSender);
};

/**
 * Check if webhook is from a Click-to-WhatsApp advertisement
 */
export const isReferralMessage = (data: any): boolean => {
  return !!(data.ReferralSourceId || data.ReferralBody);
};