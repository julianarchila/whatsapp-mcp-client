import { Twilio } from 'twilio';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SendSMSParams {
  to: string;
  message: string;
}

class SMSService {
  private client: Twilio | null = null;
  private config: SMSConfig | null = null;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.initializeConfig();
  }

  private initializeConfig(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_NUMBER;

    if (accountSid && authToken && fromNumber) {
      this.config = {
        accountSid,
        authToken,
        fromNumber,
      };
      
      try {
        this.client = new Twilio(accountSid, authToken);
      } catch (error) {
        console.error('Failed to initialize Twilio client:', error);
        this.client = null;
      }
    } else {
      if (!this.isDevelopment) {
        console.warn('Twilio configuration missing. Required env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER');
      }
    }
  }

  private logToConsole(phoneNumber: string, code: string): void {
    console.log(`📱 OTP for ${phoneNumber}: ${code}`);
    console.log("=".repeat(50));
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Code:  ${code}`);
    console.log("=".repeat(50));
  }

  async sendOTP(phoneNumber: string, code: string): Promise<void> {
    // Always log to console in development mode
    if (this.isDevelopment) {
      this.logToConsole(phoneNumber, code);
    }

    // If Twilio is not configured or we're in development mode, just return
    if (!this.client || !this.config || this.isDevelopment) {
      return Promise.resolve();
    }

    try {
      const message = `Your verification code is: ${code}`;
      await this.sendSMS({
        to: phoneNumber,
        message,
      });
      
      console.log(`✅ OTP sent successfully to ${phoneNumber}`);
    } catch (error) {
      console.error(`❌ Failed to send OTP to ${phoneNumber}:`, error);
      throw new Error('Failed to send OTP. Please try again.');
    }
  }

  private async sendSMS({ to, message }: SendSMSParams): Promise<void> {
    if (!this.client || !this.config) {
      throw new Error('SMS service not properly configured');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: to,
      });

      console.log(`SMS sent with SID: ${result.sid}`);
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.config !== null;
  }

  getStatus(): { configured: boolean; development: boolean } {
    return {
      configured: this.isConfigured(),
      development: this.isDevelopment,
    };
  }
}

// Export a singleton instance
export const smsService = new SMSService();
