import { 
  parseWhatsAppWebhook, 
  validateTwilioSignature, 
  getWebhookUrl, 
  createTwiMLResponse
} from '@/server/lib/twilio';
import type { 
  WhatsAppIncomingMessage,
  WhatsAppStatusCallback 
} from '@/server/lib/twilio';
import { chatbot } from '@/server/services/chatbot';
import { getOrCreateWhatsAppUser } from '@/server/services/auth';

export const POST = async (request: Request) => {
  console.log('📞 WhatsApp webhook received');
  
  // 1. Validate signature
  const signature = request.headers.get('x-twilio-signature');
  if (!signature) {
    console.error('❌ Missing Twilio signature');
    return new Response('Unauthorized', { status: 401 });
  }

  // Parse webhook data first (we need it for signature validation)
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData().catch(() => null);
  if (!formData) {
    console.error('❌ Failed to parse form data');
    return new Response('Bad Request', { status: 400 });
  }
  
  const params = Object.fromEntries(formData.entries());
  const webhookUrl = getWebhookUrl(request);
  const isValidSignature = validateTwilioSignature(params, signature, webhookUrl);
  
  if (!isValidSignature) {
    console.error('❌ Invalid Twilio signature');
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse and validate WhatsApp webhook
  const webhookResult = await parseWhatsAppWebhook(request);
  if (webhookResult.isErr()) {
    console.error('❌ WhatsApp webhook parsing failed:', webhookResult.error);
    return new Response('Bad Request', { status: 400 });
  }

  const { type, data, rawData } = webhookResult.value;
  console.log(`📱 WhatsApp webhook type: ${type}`);

  // 3. Handle different WhatsApp webhook types
  switch (type) {
    case 'incoming_message':
      return await handleWhatsAppMessage(data as WhatsAppIncomingMessage);
      
    case 'status_callback':
      return handleWhatsAppStatus(data as WhatsAppStatusCallback, rawData);
      
    default:
      console.log(`🤷 Unknown WhatsApp webhook type: ${type}`);
      return new Response('OK', { status: 200 });
  }
};

/**
 * Handle incoming WhatsApp messages
 */
const handleWhatsAppMessage = async (webhook: WhatsAppIncomingMessage) => {
  const { From, Body, MessageSid, ProfileName, WaId, NumMedia, Latitude, Longitude, Address } = webhook;
  
  // Log incoming message with WhatsApp context
  console.log(`📱 WhatsApp message from ${From}: "${Body}"`);
  
  // Handle special WhatsApp message types
  if (Latitude && Longitude) {
    console.log(`📍 Location shared: ${Latitude}, ${Longitude}${Address ? ` (${Address})` : ''}`);
  }
  
  if (NumMedia && parseInt(NumMedia) > 0) {
    console.log(`📎 Media attachments: ${NumMedia}`);
    // TODO: Handle media attachments
    return createTwiMLResponse("I received your media! I can only process text messages at the moment, but I'm working on supporting media soon!");
  }
  
  // Get or create user
  const userResult = await getOrCreateWhatsAppUser(From);
  if (userResult.isErr()) {
    console.error(`❌ Auth error: ${userResult.error.message}`);
    return createTwiMLResponse("Sorry, I'm having trouble right now. Please try again later.");
  }

  const user = userResult.value;
  console.log(`👤 Processing for user: ${user.id}`);

  // Get chatbot response
  const chatbotResult = await chatbot(user.id, Body);
  if (chatbotResult.isErr()) {
    console.error(`❌ Chatbot error: ${chatbotResult.error.message}`);
    return createTwiMLResponse("I'm having trouble processing your message. Please try again.");
  }

  console.log(`✅ Sending WhatsApp response`);
  return createTwiMLResponse(chatbotResult.value);
};

/**
 * Handle WhatsApp status callbacks (just log for now)
 */
const handleWhatsAppStatus = (
  webhook: WhatsAppStatusCallback, 
  rawData: Record<string, any>
) => {
  const status = webhook.MessageStatus || webhook.SmsStatus || 'unknown';
  console.log(`📊 WhatsApp status: ${webhook.MessageSid} -> ${status}`);
  console.log('📋 Status details:', {
    messageId: webhook.MessageSid,
    status,
    messageStatus: webhook.MessageStatus,
    smsStatus: webhook.SmsStatus,
    timestamp: new Date().toISOString(),
    // Log any additional useful fields
    ...(rawData.ErrorCode && { errorCode: rawData.ErrorCode }),
    ...(rawData.ErrorMessage && { errorMessage: rawData.ErrorMessage }),
    // Log all raw data for debugging
    rawData: Object.keys(rawData).length < 10 ? rawData : 'too many fields',
  });
  
  return new Response('OK', { status: 200 });
};

export const GET = () => {
  return new Response('WhatsApp webhook endpoint', { status: 200 });
};