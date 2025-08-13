import { validateTwilioWebhook, parseTwilioWebhook, createTwiMLResponse, createErrorTwiMLResponse } from '@/server/lib/twilio';
import { chatbot } from '@/server/services/chatbot';
import { getOrCreateWhatsAppUser } from '@/server/services/auth';
import { env } from '@env';

export async function POST(request: Request) {
  console.log('📞 Twilio webhook received');
  
  try {
    // Validate Twilio signature if configured
    const signature = request.headers.get('x-twilio-signature');
    if (signature) {
      const validationResult = await validateTwilioWebhook(request, signature);
      if (validationResult.isErr()) {
        console.error(`❌ Signature validation failed: ${validationResult.error.message}`);
        return new Response('Unauthorized', { status: 401 });
      }
      
      if (!validationResult.value) {
        console.error('❌ Invalid Twilio signature');
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Parse webhook data
    const formData = await request.formData();
    const webhookResult = parseTwilioWebhook(formData);
    if (webhookResult.isErr()) {
      console.error(`❌ Webhook parsing failed: ${webhookResult.error.message}`);
      return createErrorTwiMLResponse('Invalid message format');
    }

    const webhookData = webhookResult.value;
    console.log(`📱 Message from ${webhookData.From}: ${webhookData.Body}`);

    // Get or create user from WhatsApp phone number
    const userResult = await getOrCreateWhatsAppUser(webhookData.From);
    if (userResult.isErr()) {
      const error = userResult.error;
      console.error(`❌ Auth Error [${error.type}]: ${error.message}`);
      if (error.cause) {
        console.error('  Cause:', error.cause);
      }
      return createErrorTwiMLResponse("Sorry, I'm having trouble processing your message right now. Please try again later.");
    }

    const user = userResult.value;
    console.log(`👤 Processing message for user: ${user.id} (${user.name})`);

    // Process message with chatbot
    const chatbotResult = await chatbot(user.id, webhookData.Body);
    if (chatbotResult.isErr()) {
      const error = chatbotResult.error;
      console.error(`❌ Chatbot Error [${error.type}]: ${error.message}`);
      if (error.cause) {
        console.error('  Cause:', error.cause);
      }
      return createErrorTwiMLResponse("I'm having trouble processing your message right now. Please try again in a moment.");
    }

    const response = chatbotResult.value;

    // Create TwiML response
    const twimlResult = createTwiMLResponse(response);
    if (twimlResult.isErr()) {
      console.error(`❌ TwiML creation failed: ${twimlResult.error.message}`);
      return createErrorTwiMLResponse();
    }

    console.log(`✅ Response sent successfully`);
    return twimlResult.value;

  } catch (error) {
    console.error('❌ Unexpected error processing Twilio webhook:', error);
    return createErrorTwiMLResponse();
  }
}

export async function GET(request: Request) {
  // Handle status callbacks (optional)
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('MessageStatus');
  const messageSid = searchParams.get('MessageSid');

  console.log('Twilio status callback:', { status, messageSid });

  return new Response('OK', { status: 200 });
}
