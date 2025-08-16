import { 
  parseTwilioWebhook, 
  validateTwilioSignature, 
  createTwiMLResponse,
} from '@/server/lib/twilio';
import { normalizeTwilioMessage } from '@/server/integrations/twilio/normalizer';
import { processMessage } from '@/server/services/chatbot';

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

  // 3. Normalize and delegate to chatbot service
  const domain = normalizeTwilioMessage(data);
  // For text, we require a userId; we use the `From` number. For media/location, the service returns generic text.
  const result = await processMessage(domain);
  if (result.isErr()) {
    console.error('❌ Chatbot processing failed:', result.error);
    return createTwiMLResponse("I'm having trouble processing your message. Please try again.");
  }
  return createTwiMLResponse(result.value);
};

// Status callbacks are not handled by this endpoint

export const GET = () => {
  return new Response('WhatsApp webhook endpoint', { status: 200 });
};