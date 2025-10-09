import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Send OTP via WhatsApp
 * @param {string} phoneNumber - User's phone number in E.164 format (e.g., +919876543210)
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<object>} - Twilio message response
 */
export const sendWhatsAppOTP = async (phoneNumber, otp) => {
  try {
    if (!client) {
      throw new Error('Twilio client not configured. Check your environment variables.');
    }

    // Ensure phone number is in E.164 format
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`;

    const message = await client.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${formattedPhone}`,
      body: `🔐 *LocalHands Verification*\n\nYour OTP code is: *${otp}*\n\nThis code will expire in 10 minutes.\n\n⚠️ Do not share this code with anyone.`
    });

    console.log('✅ WhatsApp OTP sent:', {
      sid: message.sid,
      to: formattedPhone,
      status: message.status
    });

    return {
      success: true,
      sid: message.sid,
      status: message.status
    };
  } catch (error) {
    console.error('❌ Failed to send WhatsApp OTP:', error.message);
    throw new Error(`Failed to send WhatsApp OTP: ${error.message}`);
  }
};

/**
 * Send welcome message via WhatsApp
 * @param {string} phoneNumber - User's phone number
 * @param {string} name - User's name
 * @returns {Promise<object>}
 */
export const sendWelcomeWhatsApp = async (phoneNumber, name) => {
  try {
    if (!client) return null;

    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`;

    const message = await client.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${formattedPhone}`,
      body: `👋 Welcome to *LocalHands*, ${name}!\n\nYour account has been verified successfully. You can now book local services or start providing services in your area.\n\n✨ Thank you for joining us!`
    });

    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Failed to send welcome WhatsApp:', error.message);
    return null; // Don't fail registration if welcome message fails
  }
};

/**
 * Send booking notification via WhatsApp
 * @param {string} phoneNumber - Provider's phone number
 * @param {object} bookingData - Booking details
 * @returns {Promise<object>}
 */
export const sendBookingNotificationWhatsApp = async (phoneNumber, bookingData) => {
  try {
    if (!client) return null;

    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`;

    const { customerName, service, scheduledAt, address } = bookingData;

    const message = await client.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${formattedPhone}`,
      body: `🔔 *New Booking Request*\n\n👤 Customer: ${customerName}\n🛠️ Service: ${service}\n📅 Scheduled: ${scheduledAt}\n📍 Location: ${address}\n\nPlease check your LocalHands dashboard to accept or decline.`
    });

    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Failed to send booking notification:', error.message);
    return null;
  }
};

export default {
  sendWhatsAppOTP,
  sendWelcomeWhatsApp,
  sendBookingNotificationWhatsApp
};
