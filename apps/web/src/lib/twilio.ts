import twilio from 'twilio';

export interface TwilioWebhookData {
  From: string;
  Body: string;
  To: string;
  MessageSid: string;
  AccountSid: string;
  [key: string]: string;
}

export function createTwiMLResponse(message: string): Response {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  
  return new Response(twiml.toString(), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

export function parseTwilioWebhook(formData: FormData): TwilioWebhookData {
  return Object.fromEntries(formData.entries()) as TwilioWebhookData;
}

// Validate Twilio webhook signature
export async function validateTwilioWebhook(
  request: Request,
  authToken: string,
  signature: string,
  url: string
): Promise<boolean> {
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    
    // Handle form-encoded data (most common for Twilio webhooks)
    if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const params = Object.fromEntries(formData.entries());
      return twilio.validateRequest(authToken, signature, url, params);
    }
    
    // Handle JSON data
    if (request.headers.get('content-type')?.includes('application/json')) {
      return twilio.validateRequestWithBody(authToken, signature, url, body);
    }
    
    // Fallback for other content types
    return twilio.validateRequest(authToken, signature, url, {});
    
  } catch (error) {
    console.error('Twilio signature validation failed:', error);
    return false;
  }
}

/**
 * Get the actual URL that Twilio is calling for signature validation.
 * 
 * This function is necessary because Twilio calculates the webhook signature
 * based on the URL it's calling, not the internal URL that Next.js sees.
 * 
 * In development with Cloudflare tunnel: Twilio calls `https://dev.example.com/api/webhooks/twilio`
 * but Next.js sees `https://localhost:3001/api/webhooks/twilio`
 * 
 * In production: Twilio calls `https://yourdomain.com/api/webhooks/twilio`
 * and Next.js sees the same URL
 * 
 * @param request - The incoming request object
 * @returns The actual URL that Twilio used to calculate the signature
 * 
 * @example
 * // Development (Cloudflare tunnel)
 * // request.headers: { 'x-forwarded-host': 'dev.example.com', 'x-forwarded-proto': 'https' }
 * getActualUrl(request) // returns: 'https://dev.example.com/api/webhooks/twilio'
 * 
 * @example
 * // Production (direct access)
 * // request.headers: { 'host': 'yourdomain.com' }
 * getActualUrl(request) // returns: 'https://yourdomain.com/api/webhooks/twilio'
 */
export function getActualUrl(request: Request): string {
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
} 