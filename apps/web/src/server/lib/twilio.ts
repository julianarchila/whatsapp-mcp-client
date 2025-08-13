import twilio from 'twilio';
import { Result, ok, err, ResultAsync } from 'neverthrow';
import { env } from '@env';

// Error types for Twilio operations
type TwilioErrorType = 'SIGNATURE_VALIDATION_FAILED' | 'INVALID_WEBHOOK_DATA' | 'TWIML_CREATION_FAILED';

export class TwilioError extends Error {
  constructor(public readonly type: TwilioErrorType, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'TwilioError';
  }
}

// Types
export interface TwilioWebhookData {
  From: string;
  Body: string;
  To: string;
  MessageSid: string;
  AccountSid: string;
  [key: string]: string;
}

/**
 * Create a TwiML response for Twilio webhook
 */
export const createTwiMLResponse = (message: string) => {
  try {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(message);
    
    return ok(new Response(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    }));
  } catch (error) {
    return err(new TwilioError('TWIML_CREATION_FAILED', 'Failed to create TwiML response', error));
  }
};

/**
 * Parse Twilio webhook form data
 */
export const parseTwilioWebhook = (formData: FormData): Result<TwilioWebhookData, TwilioError> => {
  try {
    const data = Object.fromEntries(formData.entries()) as TwilioWebhookData;
    
    // Basic validation
    if (!data.From || !data.Body) {
      return err(new TwilioError('INVALID_WEBHOOK_DATA', 'Missing required webhook fields: From or Body'));
    }
    
    return ok(data);
  } catch (error) {
    return err(new TwilioError('INVALID_WEBHOOK_DATA', 'Failed to parse webhook data', error));
  }
};

/**
 * Get the actual URL that Twilio is calling for signature validation.
 * 
 * This function is necessary because Twilio calculates the webhook signature
 * based on the URL it's calling, not the internal URL that Next.js sees.
 */
const getActualUrl = (request: Request): string => {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');
  const protocol = forwardedProto || 'https';
  
  if (forwardedHost && forwardedProto) {
    // Cloudflare tunnel (development)
    return `${forwardedProto}://${forwardedHost}/api/webhooks/twilio`;
  } else if (host) {
    // Direct access (production)
    return `${protocol}://${host}/api/webhooks/twilio`;
  }
  
  // Fallback
  return new URL(request.url).href;
};

/**
 * Validate Twilio webhook signature
 */
export const validateTwilioWebhook = (request: Request, signature: string) =>
  ResultAsync.fromPromise(
    (async () => {
      const clonedRequest = request.clone();
      const actualUrl = getActualUrl(request);
      const authToken = env.TWILIO_AUTH_TOKEN;
      
      // Handle form-encoded data (most common for Twilio webhooks)
      if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        const params = Object.fromEntries(formData.entries());
        return twilio.validateRequest(authToken, signature, actualUrl, params);
      }
      
      // Handle JSON data
      if (request.headers.get('content-type')?.includes('application/json')) {
        const body = await clonedRequest.text();
        return twilio.validateRequestWithBody(authToken, signature, actualUrl, body);
      }
      
      // Fallback for other content types
      return twilio.validateRequest(authToken, signature, actualUrl, {});
    })(),
    (error) => new TwilioError('SIGNATURE_VALIDATION_FAILED', 'Failed to validate Twilio webhook signature', error)
  );

/**
 * Create an error TwiML response
 */
export const createErrorTwiMLResponse = (message: string = "I'm having trouble processing your message right now. Please try again later.") => {
  const result = createTwiMLResponse(message);
  // Since this is for error cases, we'll return a default response if TwiML creation fails
  if (result.isErr()) {
    return new Response('Error', { status: 500 });
  }
  return result.value;
};
