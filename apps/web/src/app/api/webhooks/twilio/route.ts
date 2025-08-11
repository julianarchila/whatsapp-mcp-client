import twilio from 'twilio';
import { validateTwilioWebhook, getActualUrl } from '@/lib/twilio';
import { chatbot } from '@/server/services/chatbot';
import { getOrCreateWhatsAppUser, AuthError } from '@/server/services/auth';
import { env } from '@env';

export async function POST(request: Request) {
  try {
    // Validate Twilio signature if auth token is configured
    const authToken = env.TWILIO_AUTH_TOKEN;
    const signature = request.headers.get('x-twilio-signature');

    if (authToken && signature) {
      const actualUrl = getActualUrl(request);
      const clonedRequest = request.clone();

      const isValid = await validateTwilioWebhook(clonedRequest, authToken, signature, actualUrl);
      if (!isValid) {
        console.error('Invalid Twilio signature');
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Process the webhook
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());

    console.log('Twilio webhook received:', body);

    // Handle incoming WhatsApp messages
    if (body.From && body.Body) {
      const from = body.From as string;
      const message = body.Body as string;

      console.log(`Message from ${from}: ${message}`);

      // Get or create user from WhatsApp phone number
      const userResult = await getOrCreateWhatsAppUser(from);
      if (userResult.isErr()) {
        const error = userResult.error;
        console.error(`❌ Auth Error [${error.type}]: ${error.message}`);
        if (error.cause) {
          console.error('  Cause:', error.cause);
        }
        // Return error response to user
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message("Sorry, I'm having trouble processing your message right now. Please try again later.");
        return new Response(twiml.toString(), {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
      }

      const user = userResult.value;
      console.log(`📱 Processing message for user: ${user.id} (${user.name})`);

      // Process message with full chat history and persistence
      const response = await chatbot(user.id, message);

      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(response);

      return new Response(twiml.toString(), {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    return new Response('', { status: 200 });

  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
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
