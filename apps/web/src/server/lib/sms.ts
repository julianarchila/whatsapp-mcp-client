import { Twilio } from 'twilio';
import { Result, ok, err, ResultAsync, fromThrowable } from 'neverthrow';
import { env } from '@env'

// Error types for SMS operations
type SMSErrorType = 'SEND_FAILED' | 'INVALID_PHONE_NUMBER' | 'INVALID_CODE';

export class SMSError extends Error {
  constructor(public readonly type: SMSErrorType, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'SMSError';
  }
}

// Configuration type
type SMSConfig = {
  readonly accountSid: string;
  readonly authToken: string;
  readonly fromNumber: string;
};

// Helper functions
const isDevelopment = () => env.NODE_ENV === 'development';

const validateInput = (phoneNumber: string, code: string) => {
  if (!phoneNumber?.trim()) {
    return err(new SMSError('INVALID_PHONE_NUMBER', 'Phone number is required'));
  }
  if (!code?.trim()) {
    return err(new SMSError('INVALID_CODE', 'Verification code is required'));
  }
  return ok([phoneNumber.trim(), code.trim()]);
};

const getConfig = () => {
  return ok({
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    fromNumber: env.TWILIO_NUMBER,
  });
};

const createClient = fromThrowable(
  (config: SMSConfig) => new Twilio(config.accountSid, config.authToken),
  (error) => new SMSError('SEND_FAILED', 'Failed to create Twilio client', error)
);

const logDevOTP = (phoneNumber: string, code: string) => {
  console.log('\n' + '='.repeat(50));
  console.log(`📱 Development OTP`);
  console.log(`Phone: ${phoneNumber}`);
  console.log(`Code:  ${code}`);
  console.log('='.repeat(50) + '\n');
};

const sendTwilioSMS = (client: Twilio, config: SMSConfig, phoneNumber: string, code: string) =>
  ResultAsync.fromPromise(
    client.messages.create({
      body: `Your verification code is: ${code}`,
      from: config.fromNumber,
      to: phoneNumber,
    }),
    (error) => new SMSError('SEND_FAILED', 'Failed to send SMS', error)
  ).map((message) => {
    console.log(`✅ SMS sent successfully (SID: ${message.sid})`);
  });

/**
 * Send OTP via SMS using Twilio
 * In development mode, logs the OTP to console instead of sending
 */
export const sendOTP = async (phoneNumber: string, code: string) => {
  console.log(`📱 Sending OTP to: ${phoneNumber}`);
  
  // Validate input
  const inputResult = validateInput(phoneNumber, code);
  if (inputResult.isErr()) {
    console.error(`❌ Input validation failed: ${inputResult.error.message}`);
    return err(inputResult.error);
  }

  const [validPhone, validCode] = inputResult.value;

  // Development mode: just log
  if (isDevelopment()) {
    logDevOTP(validPhone, validCode);
    console.log(`✅ OTP logged in development mode`);
    return ok(undefined);
  }

  // Production mode: send via Twilio
  const config = getConfig().value;
  const clientResult = createClient(config);
  if (clientResult.isErr()) {
    console.error(`❌ Client creation failed: ${clientResult.error.message}`);
    return err(clientResult.error);
  }

  const sendResult = await sendTwilioSMS(clientResult.value, config, validPhone, validCode);
  if (sendResult.isErr()) {
    console.error(`❌ SMS sending failed: ${sendResult.error.message}`);
    return err(sendResult.error);
  }

  console.log(`✅ OTP sent successfully to ${validPhone}`);
  return ok(undefined);
};

