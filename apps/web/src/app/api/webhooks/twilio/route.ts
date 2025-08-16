import { 
  parseTwilioWebhook, 
  validateTwilioSignature, 
  createTwiMLResponse,
} from '@/server/lib/twilio';
import type { 
  TwilioIncomingMessage,
} from '@/server/lib/twilio';
import { chatbot } from '@/server/services/chatbot';
import { getOrCreateWhatsAppUser } from '@/server/services/auth';

export const POST = async (request: Request) => {
  console.log('📞 Twilio webhook received');
  
  // 1. Validate signature (utility handles headers, URL, and body)
  const isValidSignature = await validateTwilioSignature(request.clone());
  if (!isValidSignature) {
    console.error('❌ Invalid or missing Twilio signature');
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse and validate Twilio webhook
  const webhookResult = await parseTwilioWebhook(request);
  if (webhookResult.isErr()) {
    console.error('❌ Twilio webhook parsing failed:', webhookResult.error);
    return new Response('Bad Request', { status: 400 });
  }

  const { data, rawData } = webhookResult.value;
  console.log('📋 Raw data:', rawData);

  // 3. Handle incoming WhatsApp message
  return await handleIncomingMessage(data as TwilioIncomingMessage);
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
  const chatbotResult = await chatbot(user.id, Body || '');
  if (chatbotResult.isErr()) {
    console.error(`❌ Chatbot error: ${chatbotResult.error.message}`);
    return createTwiMLResponse("I'm having trouble processing your message. Please try again.");
  }

  console.log(`✅ Sending response`);
  return createTwiMLResponse(chatbotResult.value);
};

// Status callbacks are not handled by this endpoint

export const GET = () => {
  return new Response('WhatsApp webhook endpoint', { status: 200 });
};