import twilio from 'twilio';
import { z } from 'zod';
import { ok, err } from 'neverthrow';
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
  
}).catchall(z.string().optional());

// Incoming message schema (we only handle incoming messages for this endpoint)
const TwilioIncomingMessageSchema = TwilioBaseSchema
  .extend(MediaParametersSchema.shape)
  .extend(WhatsAppParametersSchema.shape);

// Inferred types
export type TwilioIncomingMessage = z.infer<typeof TwilioIncomingMessageSchema>;

// We only support incoming messages in this endpoint



/**
 * Validate Twilio webhook signature using the full Request
 * The caller should pass a cloned Request so the body can be consumed here safely.
 */
export const validateTwilioSignature = async (request: Request): Promise<boolean> => {
  const signature = request.headers.get('x-twilio-signature');
  if (!signature) return false;

  const formData = await request.formData().catch(() => null);
  if (!formData) return false;

  const params = Object.fromEntries(formData.entries());
  const url = getWebhookUrl(request);
  const isValid = twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, url, params);
  return !!isValid;
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
 * Parse and validate Twilio incoming message webhook
 */
export const parseTwilioWebhook = async (request: Request) => {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return err('Failed to parse form data');
  }

  const rawData = Object.fromEntries(formData.entries());
  const validationResult = TwilioIncomingMessageSchema.safeParse(rawData);

  if (!validationResult.success) {
    return err(`Invalid Twilio incoming message webhook: ${validationResult.error.message}`);
  }

  return ok({
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

// We only configured WhatsApp webhooks in Twilio, so no channel check is needed here

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