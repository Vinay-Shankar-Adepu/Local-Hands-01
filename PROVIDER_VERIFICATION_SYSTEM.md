# 🔐 Provider License Verification & Admin Approval System

**Date:** October 9, 2025  
**Status:** ✅ Fully Implemented

---

## 📋 **Feature Overview**

This system ensures that **only verified providers** can go live and accept bookings. Providers must upload their license (Aadhar/PAN/Driving License) and wait for admin approval.

---

## 🎯 **Workflow**

```
Provider Registration
        ↓
Set Role to "Provider"
        ↓
Upload License Image
        ↓
Status: "Pending" ⏳
        ↓
Admin Reviews License
        ↓
   ┌────┴────┐
   ↓         ↓
Approve   Reject ❌
   ↓         ↓
Status:   Status:
"Approved" "Rejected"
   ✅         ↓
   ↓     Reason Given
Can Go    Cannot Go Live
  Live    (Must Resubmit)
```

---

## 🗄️ **Database Schema Updates**

### **User Model** (`backend/src/models/User.js`)

**New Fields Added:**
```javascript
{
  // Existing fields...
  onboardingStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  
  // ✅ NEW License verification fields
  licenseImage: { type: String }, // URL/path to uploaded license
  licenseType: { 
    type: String, 
    enum: ["aadhar", "pan", "driving_license", "other"] 
  },
  licenseNumber: { type: String }, // Optional license number
  verificationSubmittedAt: { type: Date }, // When provider submitted
  verificationReviewedAt: { type: Date }, // When admin reviewed
  verificationReviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }, // Admin who reviewed
  rejectionReason: { type: String } // Why rejected (if rejected)
}
```

---

## 🔌 **API Endpoints**

### **Provider Endpoints**

#### **1. Submit License for Verification**
```http
POST /api/providers/submit-verification
Authorization: Bearer <provider_token>
Content-Type: application/json

{
  "licenseImage": "https://cloudinary.com/licenses/aadhar123.jpg",
  "licenseType": "aadhar",
  "licenseNumber": "1234-5678-9012" // Optional
}
```

**Response:**
```json
{
  "user": {
    "_id": "provider_id",
    "name": "John Doe",
    "onboardingStatus": "pending",
    "licenseImage": "https://...",
    "verificationSubmittedAt": "2025-10-09T10:30:00Z"
  },
  "message": "License submitted successfully. Waiting for admin approval."
}
```

---

#### **2. Get Verification Status**
```http
GET /api/providers/verification-status
Authorization: Bearer <provider_token>
```

**Response (Pending):**
```json
{
  "status": "pending",
  "licenseImage": "https://...",
  "licenseType": "aadhar",
  "submittedAt": "2025-10-09T10:30:00Z",
  "rejectionReason": null
}
```

**Response (Rejected):**
```json
{
  "status": "rejected",
  "licenseImage": "https://...",
  "licenseType": "aadhar",
  "submittedAt": "2025-10-09T10:30:00Z",
  "rejectionReason": "Image is blurry. Please upload a clear photo."
}
```

**Response (Approved):**
```json
{
  "status": "approved",
  "licenseImage": "https://...",
  "licenseType": "aadhar",
  "submittedAt": "2025-10-09T10:30:00Z",
  "rejectionReason": null
}
```

---

#### **3. Go Live (Now Checks Approval)**
```http
PATCH /api/providers/availability
Authorization: Bearer <provider_token>

{
  "isAvailable": true,
  "lng": 78.4867,
  "lat": 17.3850
}
```

**Response (If Not Approved):**
```json
{
  "message": "You must be approved by admin before going live",
  "onboardingStatus": "pending",
  "hint": "Your license verification is pending admin approval"
}
```

**Response (If Rejected):**
```json
{
  "message": "You must be approved by admin before going live",
  "onboardingStatus": "rejected",
  "hint": "Your verification was rejected. Please resubmit your license."
}
```

**Response (If Approved):**
```json
{
  "user": {
    "isAvailable": true,
    "isLiveTracking": true,
    "onboardingStatus": "approved"
  }
}
```

---

### **Admin Endpoints**

#### **1. Get Pending Verifications**
```http
GET /api/admin/verifications/pending
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "count": 5,
  "providers": [
    {
      "_id": "provider_id_1",
      "name": "John Doe",
      "email": "john@test.com",
      "phone": "9876543210",
      "licenseImage": "https://...",
      "licenseType": "aadhar",
      "licenseNumber": "1234-5678-9012",
      "verificationSubmittedAt": "2025-10-09T10:30:00Z",
      "createdAt": "2025-10-08T14:20:00Z"
    },
    // ... more providers
  ]
}
```

---

#### **2. Get Approved Providers**
```http
GET /api/admin/verifications/approved
Authorization: Bearer <admin_token>
```

---

#### **3. Get Rejected Providers**
```http
GET /api/admin/verifications/rejected
Authorization: Bearer <admin_token>
```

---

#### **4. Get Verification Statistics**
```http
GET /api/admin/verifications/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "stats": {
    "total": 50,
    "pending": 5,
    "approved": 40,
    "rejected": 5
  }
}
```

---

#### **5. Get Provider Verification Details**
```http
GET /api/admin/verifications/:providerId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "provider": {
    "_id": "provider_id",
    "name": "John Doe",
    "email": "john@test.com",
    "phone": "9876543210",
    "licenseImage": "https://cloudinary.com/licenses/aadhar123.jpg",
    "licenseType": "aadhar",
    "licenseNumber": "1234-5678-9012",
    "onboardingStatus": "pending",
    "verificationSubmittedAt": "2025-10-09T10:30:00Z",
    "rating": 0,
    "ratingCount": 0,
    "completedJobs": 0,
    "createdAt": "2025-10-08T14:20:00Z"
  }
}
```

---

#### **6. Approve Provider**
```http
POST /api/admin/verifications/:providerId/approve
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Provider approved successfully",
  "provider": {
    "id": "provider_id",
    "name": "John Doe",
    "email": "john@test.com",
    "onboardingStatus": "approved"
  }
}
```

**Side Effects:**
- ✅ Provider `onboardingStatus` set to `"approved"`
- ✅ `verificationReviewedAt` timestamp set
- ✅ `verificationReviewedBy` set to admin ID
- ✅ Notification sent to provider: "Congratulations! Your license has been approved..."
- ✅ Provider can now go live

---

#### **7. Reject Provider**
```http
POST /api/admin/verifications/:providerId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "License image is blurry. Please upload a clear photo."
}
```

**Response:**
```json
{
  "message": "Provider rejected",
  "provider": {
    "id": "provider_id",
    "name": "John Doe",
    "email": "john@test.com",
    "onboardingStatus": "rejected",
    "rejectionReason": "License image is blurry. Please upload a clear photo."
  }
}
```

**Side Effects:**
- ✅ Provider `onboardingStatus` set to `"rejected"`
- ✅ `rejectionReason` stored
- ✅ `verificationReviewedAt` timestamp set
- ✅ `isAvailable` forced to `false` (if they were somehow live)
- ✅ Notification sent to provider with rejection reason
- ✅ Provider can resubmit license

---

## 🔒 **Security & Validation**

### **Provider Go Live Checks**
```javascript
// In setAvailability()
if (isAvailable) {
  // 1. Check approval status
  if (provider.onboardingStatus !== 'approved') {
    return 403 Error: "Must be approved by admin"
  }
  
  // 2. Check for active bookings
  if (hasActiveBooking) {
    return 400 Error: "Cannot go live during active service"
  }
  
  // 3. Update location
  if (lng && lat provided) {
    updateLocation()
  }
  
  // 4. Go live
  setIsAvailable(true)
}
```

### **Admin Authorization**
- All admin endpoints require `requireAuth` + `requireRole('admin')`
- Only admins can approve/reject providers
- Admin ID is logged in `verificationReviewedBy` field

### **Provider Re-submission**
- Rejected providers can call `/submit-verification` again
- Status changes from `"rejected"` → `"pending"`
- Old rejection reason is cleared
- New review cycle begins

---

## 🎨 **Frontend Implementation Guide**

### **Provider Side**

#### **1. License Upload Component**

```jsx
// frontend/src/pages/ProviderVerification.js
import { useState } from 'react';
import API from '../services/api';

export default function ProviderVerification() {
  const [licenseImage, setLicenseImage] = useState('');
  const [licenseType, setLicenseType] = useState('aadhar');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    // TODO: Upload to Cloudinary or your storage
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_preset');
    
    const res = await fetch('https://api.cloudinary.com/v1_1/your_cloud/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setLicenseImage(data.secure_url);
  };

  const submitVerification = async () => {
    setLoading(true);
    try {
      await API.post('/providers/submit-verification', {
        licenseImage,
        licenseType,
        licenseNumber
      });
      alert('License submitted! Waiting for admin approval.');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Verification Required</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <p className="text-yellow-800">
          ⚠️ You must submit your license for verification before going live
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2">License Type</label>
          <select 
            value={licenseType} 
            onChange={e => setLicenseType(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="aadhar">Aadhar Card</option>
            <option value="pan">PAN Card</option>
            <option value="driving_license">Driving License</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">License Number (Optional)</label>
          <input
            value={licenseNumber}
            onChange={e => setLicenseNumber(e.target.value)}
            placeholder="1234-5678-9012"
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Upload License Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border rounded-lg px-4 py-2"
          />
          {licenseImage && (
            <img src={licenseImage} alt="License" className="mt-4 max-w-md rounded-lg" />
          )}
        </div>

        <button
          onClick={submitVerification}
          disabled={!licenseImage || loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </div>
    </div>
  );
}
```

---

#### **2. Verification Status Component**

```jsx
// frontend/src/components/VerificationStatus.js
import { useEffect, useState } from 'react';
import API from '../services/api';

export default function VerificationStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    API.get('/providers/verification-status')
      .then(res => setStatus(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!status) return null;

  return (
    <div className={`p-4 rounded-lg mb-6 ${
      status.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
      status.status === 'approved' ? 'bg-green-50 border-green-200' :
      'bg-red-50 border-red-200'
    } border`}>
      {status.status === 'pending' && (
        <>
          <p className="text-yellow-800 font-medium">⏳ Verification Pending</p>
          <p className="text-sm text-yellow-700 mt-1">
            Your license is under review. You'll be notified once approved.
          </p>
        </>
      )}
      
      {status.status === 'approved' && (
        <>
          <p className="text-green-800 font-medium">✅ Verified Provider</p>
          <p className="text-sm text-green-700 mt-1">
            Your license has been approved. You can now go live!
          </p>
        </>
      )}
      
      {status.status === 'rejected' && (
        <>
          <p className="text-red-800 font-medium">❌ Verification Rejected</p>
          <p className="text-sm text-red-700 mt-1">
            Reason: {status.rejectionReason}
          </p>
          <button className="mt-2 text-red-600 underline">
            Resubmit License
          </button>
        </>
      )}
    </div>
  );
}
```

---

### **Admin Side**

#### **Admin Verification Dashboard**

```jsx
// frontend/src/pages/AdminVerifications.js
import { useEffect, useState } from 'react';
import API from '../services/api';

export default function AdminVerifications() {
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pendingRes, statsRes] = await Promise.all([
      API.get('/admin/verifications/pending'),
      API.get('/admin/verifications/stats')
    ]);
    setPending(pendingRes.data.providers);
    setStats(statsRes.data.stats);
  };

  const handleApprove = async (providerId) => {
    if (!confirm('Approve this provider?')) return;
    await API.post(`/admin/verifications/${providerId}/approve`);
    loadData();
  };

  const handleReject = async (providerId) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    await API.post(`/admin/verifications/${providerId}/reject`, { rejectionReason: reason });
    loadData();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Provider Verifications</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Providers</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      )}

      {/* Pending List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Pending Verifications ({pending.length})</h2>
        </div>
        
        {pending.map(provider => (
          <div key={provider._id} className="p-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <img 
                src={provider.licenseImage} 
                alt="License" 
                className="w-32 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{provider.name}</div>
                <div className="text-sm text-gray-600">{provider.email}</div>
                <div className="text-sm text-gray-600">
                  {provider.licenseType} - {provider.licenseNumber}
                </div>
                <div className="text-xs text-gray-500">
                  Submitted: {new Date(provider.verificationSubmittedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(provider.licenseImage, '_blank')}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  View Full
                </button>
                <button
                  onClick={() => handleApprove(provider._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(provider._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {pending.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No pending verifications
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🧪 **Testing**

### **Test Scenario 1: Provider Submits License**

```bash
# 1. Register as provider
POST /api/auth/register
{
  "name": "Test Provider",
  "email": "testprovider@test.com",
  "password": "pass123"
}

# 2. Set role
POST /api/auth/set-role
Authorization: Bearer <token>
{
  "role": "provider"
}

# 3. Submit license
POST /api/providers/submit-verification
Authorization: Bearer <token>
{
  "licenseImage": "https://example.com/license.jpg",
  "licenseType": "aadhar",
  "licenseNumber": "1234-5678-9012"
}

# 4. Check status
GET /api/providers/verification-status
Authorization: Bearer <token>

# Expected: status = "pending"

# 5. Try to go live (should fail)
PATCH /api/providers/availability
Authorization: Bearer <token>
{
  "isAvailable": true
}

# Expected: 403 Error - "Must be approved by admin"
```

---

### **Test Scenario 2: Admin Approves Provider**

```bash
# 1. Login as admin
POST /api/auth/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}

# 2. Get pending verifications
GET /api/admin/verifications/pending
Authorization: Bearer <admin_token>

# 3. Approve provider
POST /api/admin/verifications/<provider_id>/approve
Authorization: Bearer <admin_token>

# 4. Provider checks status
GET /api/providers/verification-status
Authorization: Bearer <provider_token>

# Expected: status = "approved"

# 5. Provider goes live (should succeed)
PATCH /api/providers/availability
Authorization: Bearer <provider_token>
{
  "isAvailable": true,
  "lng": 78.4867,
  "lat": 17.3850
}

# Expected: 200 OK - isAvailable = true
```

---

### **Test Scenario 3: Admin Rejects Provider**

```bash
# 1. Reject provider
POST /api/admin/verifications/<provider_id>/reject
Authorization: Bearer <admin_token>
{
  "rejectionReason": "License image is blurry"
}

# 2. Provider checks status
GET /api/providers/verification-status
Authorization: Bearer <provider_token>

# Expected:
{
  "status": "rejected",
  "rejectionReason": "License image is blurry"
}

# 3. Provider resubmits
POST /api/providers/submit-verification
Authorization: Bearer <provider_token>
{
  "licenseImage": "https://example.com/new_clear_license.jpg",
  "licenseType": "aadhar"
}

# Expected: status = "pending" again
```

---

## ✅ **Implementation Checklist**

- [x] Added license fields to User model
- [x] Created provider verification controller functions
- [x] Created admin approval/rejection controller functions
- [x] Added approval check to `setAvailability`
- [x] Added provider routes (`/submit-verification`, `/verification-status`)
- [x] Added admin routes (`/verifications/*`)
- [x] Created notifications on approve/reject
- [x] Documentation complete

---

## 🚀 **Next Steps**

### **1. Image Upload Integration**
Currently expects image URL. Integrate with:
- **Cloudinary** (recommended)
- **AWS S3**
- **Firebase Storage**
- **Local uploads** (not recommended for production)

### **2. Email Notifications**
Send emails on:
- License submitted (to admin)
- Approved (to provider)
- Rejected (to provider with reason)

### **3. Real-Time Admin Alerts**
Use Socket.io to notify admins immediately when new license submitted

### **4. Bulk Approval**
Add endpoint for approving multiple providers at once

---

**Documentation Complete!** ✅  
System is ready for testing and deployment.
