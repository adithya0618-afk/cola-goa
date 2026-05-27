import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

/**
 * Sends a WhatsApp message using the Twilio Sandbox.
 * If sending fails, it logs the error but does not throw, ensuring
 * that the main administrator checkout/check-in workflows remain uninterrupted.
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    if (!phone) {
      console.warn('[WhatsApp Service] Cancelled: No phone number provided.');
      return;
    }

    // Format phone number cleanly
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        // Default to India country code (+91) if it's 10 digits (Goa resort)
        formattedPhone = '+91' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    console.log(`[WhatsApp Service] Attempting to send message to ${formattedPhone}...`);

    const result = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${formattedPhone}`,
      body: message,
    });

    console.log(`[WhatsApp Service] Message successfully sent! SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('[WhatsApp Service] Twilio WhatsApp sending failed:', error);
    // Requirement 8: If WhatsApp fails, booking action should still complete, log error only, do not break admin flow.
  }
}
