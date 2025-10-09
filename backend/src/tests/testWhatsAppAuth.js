// Quick test script for WhatsApp Authentication
// Run this in backend folder: node src/tests/testWhatsAppAuth.js

import { generateOTP, sendWhatsAppOTP } from '../services/twilioService.js';

async function testWhatsAppAuth() {
  console.log('🧪 Testing WhatsApp Authentication...\n');

  try {
    // Test 1: Generate OTP
    console.log('1️⃣ Generating OTP...');
    const otp = generateOTP();
    console.log('✅ OTP Generated:', otp);
    console.log('   (Should be 6 digits)\n');

    // Test 2: Send WhatsApp OTP
    console.log('2️⃣ Sending WhatsApp OTP...');
    console.log('⚠️  Make sure your phone number joined the Twilio sandbox!');
    console.log('   Send "join <code>" to +1 415 523 8886\n');
    
    // REPLACE WITH YOUR PHONE NUMBER (include country code)
    const testPhone = '+YOUR_PHONE_NUMBER_HERE'; // e.g., +919876543210
    
    if (testPhone === '+YOUR_PHONE_NUMBER_HERE') {
      console.log('❌ Please edit this file and replace YOUR_PHONE_NUMBER_HERE with your actual phone number');
      return;
    }

    const result = await sendWhatsAppOTP(testPhone, otp);
    
    if (result.success) {
      console.log('✅ WhatsApp OTP Sent Successfully!');
      console.log('   Message SID:', result.messageSid);
      console.log('\n📱 Check your WhatsApp for the OTP!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if .env file has correct Twilio credentials');
    console.error('2. Make sure you joined the Twilio sandbox (send "join <code>" to +1 415 523 8886)');
    console.error('3. Verify phone number format includes country code (e.g., +91...)');
  }
}

// Run the test
testWhatsAppAuth();
