# 📱 WhatsApp OTP Authentication - Complete Setup Guide

## 🎯 Overview
This guide will help you set up mobile-based registration and login using **Twilio WhatsApp** for sending OTP codes.

---

## ✅ What's Been Implemented

### Backend Features:
1. **Phone OTP Authentication System**
   - Request OTP via WhatsApp
   - Verify OTP and Register (new users)
   - Verify OTP and Login (existing users)
   - Resend OTP functionality

2. **WhatsApp Integration**
   - Twilio SDK for sending messages
   - OTP delivery via WhatsApp
   - Welcome messages after registration
   - Booking notifications (bonus feature)

3. **Database Updates**
   - Added `phoneOtp` and `phoneOtpExpires` fields to User model
   - Made `email` optional (users can register with phone only)
   - Made `phone` unique for authentication

4. **API Endpoints**
   - `POST /api/mobile-auth/request-otp` - Request OTP
   - `POST /api/mobile-auth/verify-register` - Register new user
   - `POST /api/mobile-auth/verify-login` - Login existing user
   - `POST /api/mobile-auth/resend-otp` - Resend OTP

---

## 🔧 Twilio Setup Instructions

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number

### Step 2: Get WhatsApp Sandbox Access
1. Log in to [Twilio Console](https://console.twilio.com)
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Follow instructions to join the Twilio Sandbox:
   - Send a WhatsApp message to **+1 415 523 8886** (Twilio's WhatsApp number)
   - Message format: `join <your-sandbox-code>`
   - Example: `join winter-shadow`
4. You'll receive a confirmation message when joined

### Step 3: Get Your Credentials
1. Go to [Twilio Console Dashboard](https://console.twilio.com)
2. Find your **Account SID** and **Auth Token**
3. Copy these values

### Step 4: Update Your `.env` File
Open `backend/.env` and update these values:

```env
# Replace these with your actual Twilio credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Important Notes:**
- `TWILIO_ACCOUNT_SID` starts with `AC`
- `TWILIO_AUTH_TOKEN` is a 32-character string
- `TWILIO_WHATSAPP_NUMBER` should be `whatsapp:+14155238886` for sandbox
- For production, you'll need to apply for WhatsApp Business approval

### Step 5: Test the Sandbox
1. Your phone number must be added to the sandbox
2. Send `join <sandbox-code>` from your WhatsApp to +1 415 523 8886
3. Add any test phone numbers the same way

---

## 🧪 Testing the System

### Test 1: Request OTP (Registration Flow)

**Request:**
```bash
POST http://localhost:5000/api/mobile-auth/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully via WhatsApp",
  "isNewUser": true,
  "expiresIn": 600
}
```

**Check:**
- You should receive a WhatsApp message with a 6-digit OTP
- OTP expires in 10 minutes

---

### Test 2: Verify OTP and Register

**Request:**
```bash
POST http://localhost:5000/api/mobile-auth/verify-register
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "name": "John Doe",
  "role": "customer"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67890abcdef...",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "customer",
    "verified": true,
    "isAvailable": false,
    "rating": 0,
    "completedJobs": 0,
    "onboardingStatus": "pending"
  },
  "message": "Registration successful!"
}
```

---

### Test 3: Request OTP (Login Flow)

**Request:**
```bash
POST http://localhost:5000/api/mobile-auth/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully via WhatsApp",
  "isNewUser": false,
  "expiresIn": 600
}
```

---

### Test 4: Verify OTP and Login

**Request:**
```bash
POST http://localhost:5000/api/mobile-auth/verify-login
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "654321"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67890abcdef...",
    "name": "John Doe",
    "email": "",
    "phone": "+919876543210",
    "role": "customer",
    "verified": true,
    "address": "",
    "isAvailable": false,
    "rating": 4.5,
    "completedJobs": 12
  },
  "message": "Login successful!"
}
```

---

### Test 5: Resend OTP

**Request:**
```bash
POST http://localhost:5000/api/mobile-auth/resend-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully via WhatsApp",
  "expiresIn": 600
}
```

---

## 📱 Phone Number Format

**IMPORTANT:** Phone numbers MUST be in E.164 format:
- ✅ Correct: `+919876543210` (country code + number, no spaces)
- ✅ Correct: `+14155552671`
- ❌ Wrong: `9876543210` (missing country code)
- ❌ Wrong: `+91 9876543210` (has space)
- ❌ Wrong: `+91-987-654-3210` (has dashes)

**Format Breakdown:**
```
+[country code][number]
+91 9876543210
│   │
│   └─ Phone number
└───── Country code (India)
```

**Common Country Codes:**
- 🇮🇳 India: +91
- 🇺🇸 USA: +1
- 🇬🇧 UK: +44
- 🇦🇪 UAE: +971

---

## 🔒 Security Features

1. **OTP Expiration**
   - OTPs expire after 10 minutes
   - Expired OTPs cannot be used

2. **One-Time Use**
   - Each OTP can only be used once
   - After verification, OTP is cleared from database

3. **Rate Limiting** (Recommended to add)
   - Limit OTP requests per phone number (e.g., 5 per hour)
   - Prevent spam and abuse

4. **Phone Validation**
   - E.164 format validation
   - Prevents invalid phone numbers

---

## 🚀 Development vs Production

### Development Mode
- For testing without Twilio setup, OTP is logged to console
- Check terminal/logs for OTP codes
- Set `NODE_ENV=development` in `.env`

```javascript
// In development, OTP is logged:
console.log(`📱 OTP for ${phone}: ${otp}`);

// Response includes OTP for easy testing:
{
  "message": "OTP generation successful. Check server logs for OTP",
  "devOtp": "123456"  // Only in development
}
```

### Production Mode
- Must have valid Twilio credentials
- OTP sent via WhatsApp only
- No OTP in response or logs
- Apply for WhatsApp Business API approval

---

## 🎨 Frontend Integration (Next Steps)

### Create Mobile Login Page

**File:** `frontend/src/pages/MobileLoginPage.jsx`

```jsx
import { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MobileLoginPage() {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Register (if new)
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const requestOTP = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.post('/mobile-auth/request-otp', { phone });
      setIsNewUser(data.isNewUser);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (isNewUser) {
        // Show registration form
        setStep(3);
      } else {
        // Login directly
        const { data } = await API.post('/mobile-auth/verify-login', { phone, otp });
        login(data.token, data.user);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.post('/mobile-auth/verify-register', {
        phone, otp, name, role
      });
      login(data.token, data.user);
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Login with WhatsApp</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Enter Phone */}
        {step === 1 && (
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <button
              onClick={requestOTP}
              disabled={loading || !phone}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              {loading ? 'Sending...' : 'Send OTP via WhatsApp'}
            </button>
          </div>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <div>
            <label className="block text-sm font-medium mb-2">Enter OTP</label>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}

        {/* Step 3: Complete Registration (New Users Only) */}
        {step === 3 && isNewUser && (
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            
            <label className="block text-sm font-medium mb-2">I want to:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            >
              <option value="customer">Book Services (Customer)</option>
              <option value="provider">Provide Services (Provider)</option>
            </select>

            <button
              onClick={completeRegistration}
              disabled={loading || !name}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📝 Database Schema Changes

### User Model Updates

```javascript
// New fields added to User schema:
phoneOtp: { type: String },           // OTP sent via WhatsApp
phoneOtpExpires: { type: Date },      // OTP expiration time

// Modified fields:
email: { type: String, unique: true, sparse: true },  // Now optional
phone: { type: String, unique: true, sparse: true },  // Now unique and used for auth
```

---

## 🐛 Troubleshooting

### Issue 1: "Twilio client not configured"
**Solution:** Check that `.env` has correct `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

### Issue 2: "Failed to send WhatsApp OTP"
**Solutions:**
1. Verify your phone joined the Twilio Sandbox
2. Check phone number is in E.164 format (+919876543210)
3. Verify Twilio credentials are correct
4. Check Twilio Console for error logs

### Issue 3: "OTP expired"
**Solution:** OTPs expire after 10 minutes. Request a new OTP using resend endpoint

### Issue 4: "Phone number already in use"
**Solution:** This phone is already registered. Use login flow instead of registration

### Issue 5: Not receiving WhatsApp messages
**Solutions:**
1. Ensure you sent `join <code>` to Twilio's WhatsApp number
2. Check WhatsApp is installed and working
3. Verify phone number format is correct
4. Check Twilio Console logs for delivery status

---

## 🎉 Testing Checklist

- [ ] Backend server running
- [ ] Twilio credentials added to `.env`
- [ ] Phone number joined Twilio Sandbox
- [ ] Request OTP endpoint working
- [ ] Received WhatsApp message with OTP
- [ ] Verify OTP and register working
- [ ] Verify OTP and login working
- [ ] Resend OTP working
- [ ] OTP expiration working (wait 10 mins)
- [ ] Invalid OTP rejected
- [ ] Phone number validation working

---

## 📚 API Documentation

All endpoints are documented in the routes file. Base URL: `http://localhost:5000/api/mobile-auth`

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/request-otp` | POST | Request OTP via WhatsApp | No |
| `/verify-register` | POST | Register new user with OTP | No |
| `/verify-login` | POST | Login existing user with OTP | No |
| `/resend-otp` | POST | Resend OTP to phone | No |

---

## 🚀 Next Steps

1. **Set up Twilio account** and get credentials
2. **Update .env file** with Twilio credentials
3. **Restart backend server** to load new config
4. **Test with Postman/Thunder Client** using the examples above
5. **Create frontend mobile login page** (example provided)
6. **Add to App.js** routing: `/mobile-login`
7. **Test end-to-end** registration and login flow

---

## 📞 Support

For Twilio-specific issues:
- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://console.twilio.com)
- [Twilio Support](https://support.twilio.com)

**Your system is ready!** Just add your Twilio credentials and start testing! 🎉
