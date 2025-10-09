/**
 * Test Script for WhatsApp OTP Authentication
 * Run this after setting up Twilio credentials
 * 
 * Usage: node testWhatsAppAuth.js
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/mobile-auth';
const TEST_PHONE = '+919876543210'; // Replace with your phone number

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

async function testRequestOTP() {
  log.header('Test 1: Request OTP');
  try {
    const response = await axios.post(`${API_URL}/request-otp`, {
      phone: TEST_PHONE
    });
    
    log.success('OTP request successful!');
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.data.devOtp) {
      log.warning(`Development OTP: ${response.data.devOtp}`);
      return response.data.devOtp;
    } else {
      log.info('Check your WhatsApp for the OTP code');
      return null;
    }
  } catch (error) {
    log.error(`Failed to request OTP: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testVerifyAndRegister(otp) {
  log.header('Test 2: Verify OTP and Register');
  try {
    const response = await axios.post(`${API_URL}/verify-register`, {
      phone: TEST_PHONE,
      otp: otp,
      name: 'Test User',
      role: 'customer'
    });
    
    log.success('Registration successful!');
    log.info(`Token: ${response.data.token.substring(0, 20)}...`);
    log.info(`User: ${JSON.stringify(response.data.user, null, 2)}`);
    
    return response.data.token;
  } catch (error) {
    log.error(`Registration failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testRequestOTPForLogin() {
  log.header('Test 3: Request OTP for Login');
  try {
    const response = await axios.post(`${API_URL}/request-otp`, {
      phone: TEST_PHONE
    });
    
    log.success('OTP request successful (for login)!');
    log.info(`Is new user: ${response.data.isNewUser}`);
    
    if (response.data.devOtp) {
      log.warning(`Development OTP: ${response.data.devOtp}`);
      return response.data.devOtp;
    } else {
      log.info('Check your WhatsApp for the OTP code');
      return null;
    }
  } catch (error) {
    log.error(`Failed to request OTP: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testVerifyAndLogin(otp) {
  log.header('Test 4: Verify OTP and Login');
  try {
    const response = await axios.post(`${API_URL}/verify-login`, {
      phone: TEST_PHONE,
      otp: otp
    });
    
    log.success('Login successful!');
    log.info(`Token: ${response.data.token.substring(0, 20)}...`);
    log.info(`User: ${JSON.stringify(response.data.user, null, 2)}`);
    
    return response.data.token;
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testResendOTP() {
  log.header('Test 5: Resend OTP');
  try {
    const response = await axios.post(`${API_URL}/resend-otp`, {
      phone: TEST_PHONE
    });
    
    log.success('OTP resent successfully!');
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.data.devOtp) {
      log.warning(`Development OTP: ${response.data.devOtp}`);
      return response.data.devOtp;
    }
  } catch (error) {
    log.error(`Failed to resend OTP: ${error.response?.data?.message || error.message}`);
  }
}

// Main test runner
async function runTests() {
  log.header('🧪 WhatsApp OTP Authentication Test Suite');
  log.info(`Testing with phone number: ${TEST_PHONE}`);
  log.warning('Make sure your backend server is running on port 5000!');
  log.warning('Make sure you have joined the Twilio WhatsApp Sandbox!');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Test 1: Request OTP (Registration)
    const otp1 = await testRequestOTP();
    
    if (!otp1) {
      log.warning('Manual OTP entry required. Run individual test functions.');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Register with OTP
    await testVerifyAndRegister(otp1);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Request OTP (Login)
    const otp2 = await testRequestOTPForLogin();
    
    if (!otp2) {
      log.warning('Manual OTP entry required for login test.');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 4: Login with OTP
    await testVerifyAndLogin(otp2);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 5: Resend OTP
    await testResendOTP();
    
    log.header('🎉 All Tests Completed!');
    
  } catch (error) {
    log.header('❌ Test Suite Failed');
    log.error('Some tests did not pass. Check the errors above.');
  }
}

// Run tests
runTests().catch(console.error);
