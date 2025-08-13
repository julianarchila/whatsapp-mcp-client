import { 
  parseTwilioWebhook, 
  validateTwilioSignature, 
  getWebhookUrl, 
  createTwiMLResponse,
  isWhatsAppWebhook
} from '@/server/lib/twilio';
import type { 
  TwilioIncomingMessage,
  TwilioStatusCallback 
} from '@/server/lib/twilio';
import { chatbot } from '@/server/services/chatbot';
import { getOrCreateWhatsAppUser } from '@/server/services/auth';

export const POST = async (request: Request) => {
  console.log('📞 Twilio webhook received');
  
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

  // 2. Parse and validate Twilio webhook
  const webhookResult = await parseTwilioWebhook(request);
  if (webhookResult.isErr()) {
    console.error('❌ Twilio webhook parsing failed:', webhookResult.error);
    return new Response('Bad Request', { status: 400 });
  }

  const { type, data, rawData } = webhookResult.value;
  
  // 3. Validate this is a WhatsApp webhook
  if (!isWhatsAppWebhook(data)) {
    console.warn('⚠️ Non-WhatsApp webhook received:', { From: data.From, To: data.To });
    return new Response('OK', { status: 200 });
  }
  
  console.log(`📱 WhatsApp webhook type: ${type}`);

  // 4. Handle different webhook types
  switch (type) {
    case 'incoming_message':
      return await handleIncomingMessage(data as TwilioIncomingMessage);
      
    case 'status_callback':
      return handleStatusCallback(data as TwilioStatusCallback, rawData);
      
    default:
      console.log(`🤷 Unknown webhook type: ${type}`);
      return new Response('OK', { status: 200 });
  }
};

/**
 * Handle incoming messages (WhatsApp and other channels)
 */
const handleIncomingMessage = async (webhook: TwilioIncomingMessage) => {
  const { From, Body, MessageSid, ProfileName, WaId, NumMedia, Latitude, Longitude, Address } = webhook;
  
  // Log incoming message with context
  console.log(`📱 Message from ${From}: "${Body}"`);
  if (ProfileName) console.log(`👤 Profile: ${ProfileName}`);
  if (WaId) console.log(`🆔 WhatsApp ID: ${WaId}`);
  
  // Handle special message types
  if (Latitude && Longitude) {
    console.log(`📍 Location shared: ${Latitude}, ${Longitude}${Address ? ` (${Address})` : ''}`);
    return createTwiMLResponse("Thanks for sharing your location! I can see where you are, but I can only respond with text messages for now.");
  }
  
  if (NumMedia && parseInt(NumMedia) > 0) {
    console.log(`📎 Media attachments: ${NumMedia}`);
    // TODO: Handle media attachments
    return createTwiMLResponse("I received your media! I can only process text messages at the moment, but I'm working on supporting media soon!");
  }
  
  // Get or create user (works for WhatsApp and other channels)
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

  console.log(`✅ Sending response`);
  return createTwiMLResponse(chatbotResult.value);
};

/**
 * Handle status callbacks (just log for now)
 */
const handleStatusCallback = (
  webhook: TwilioStatusCallback, 
  rawData: Record<string, any>
) => {
  const status = webhook.MessageStatus || webhook.SmsStatus || 'unknown';
  console.log(`📊 Message status: ${webhook.MessageSid} -> ${status}`);
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