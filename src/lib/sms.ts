import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends an SMS using Twilio.
 * Gracefully logs failures without throwing — admin flows are never interrupted.
 */
export async function sendSMS(phone: string, message: string): Promise<void> {
  try {
    if (!phone) {
      console.warn('[SMS Service] Skipped: No phone number provided.');
      return;
    }

    // Normalize phone: ensure E.164 format with country code
    let formatted = phone.trim().replace(/\s+/g, '');
    if (!formatted.startsWith('+')) {
      // 10-digit Indian mobile number → prepend +91
      formatted = formatted.length === 10 ? `+91${formatted}` : `+${formatted}`;
    }

    const from = process.env.TWILIO_SMS_FROM;
    if (!from) {
      console.warn('[SMS Service] Skipped: TWILIO_SMS_FROM env variable not set.');
      return;
    }

    console.log(`[SMS Service] Sending SMS to ${formatted}...`);

    const result = await client.messages.create({
      from,
      to: formatted,
      body: message,
    });

    console.log(`[SMS Service] SMS sent successfully. SID: ${result.sid}`);
  } catch (err) {
    // Requirement: SMS failure must NOT break the admin workflow
    console.error('[SMS Service] Failed to send SMS:', err);
  }
}
