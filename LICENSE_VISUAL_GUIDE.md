# 📸 License Display - Visual Guide

## How It Looks in Profile Page

### For Approved Provider
```
┌─────────────────────────────────────────────────────────┐
│  🛡️ License Verification Status                         │
│                                                          │
│  Status: ✓ Approved 🟢                                  │
│                                                          │
│  Uploaded License:                                       │
│  ┌──────────────────────────────┐                      │
│  │                              │                      │
│  │   [LICENSE IMAGE PREVIEW]    │ ← Click to view full │
│  │   (Hover shows tooltip)      │                      │
│  │                              │                      │
│  └──────────────────────────────┘                      │
│                                                          │
│  Type: Aadhar Card                                      │
│  Number: 1234-5678-9012                                 │
│  Submitted: Oct 8, 2025                                 │
│  Approved on: Oct 9, 2025                               │
└─────────────────────────────────────────────────────────┘
```

### For Rejected Provider
```
┌─────────────────────────────────────────────────────────┐
│  🛡️ License Verification Status                         │
│                                                          │
│  Status: ✗ Rejected 🔴                                  │
│                                                          │
│  Uploaded License:                                       │
│  ┌──────────────────────────────────┐                  │
│  │   [LICENSE IMAGE PREVIEW]        │                  │
│  └──────────────────────────────────┘                  │
│                                                          │
│  Type: Pan Card                                         │
│  Number: ABCDE1234F                                     │
│  Submitted: Oct 8, 2025                                 │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ⚠️ Rejection Reason:                              │ │
│  │ Document is blurry and unreadable. Please         │ │
│  │ upload a clear, high-quality image.               │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### For Pending Provider (No Upload Yet)
```
┌─────────────────────────────────────────────────────────┐
│  🛡️ License Verification Status                         │
│                                                          │
│  Status: ⏳ Pending Review 🟡                           │
│                                                          │
│  (No license uploaded yet)                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ MongoDB Document Structure

```javascript
{
  "_id": ObjectId("68e7899956d2087a05454c70"),
  "name": "John Provider",
  "email": "john@example.com",
  "role": "provider",
  
  // ✅ LICENSE VERIFICATION FIELDS (stored in MongoDB)
  "onboardingStatus": "approved",  // ← "pending" | "approved" | "rejected"
  "licenseImage": "https://res.cloudinary.com/daoc1mpdc/image/upload/v1728456789/localhands/licenses/license_68e7899956d2087a05454c70_1728456789123.jpg",
  "licenseType": "aadhar",  // ← "aadhar" | "pan" | "driving_license" | "other"
  "licenseNumber": "1234-5678-9012",
  "verificationSubmittedAt": ISODate("2025-10-08T10:30:00.000Z"),
  "verificationReviewedAt": ISODate("2025-10-09T14:15:00.000Z"),
  "verificationReviewedBy": ObjectId("68e7899956d2087a05454999"),  // ← Admin ID
  "rejectionReason": null,  // ← String if rejected
  
  // Other fields
  "isAvailable": false,
  "rating": 4.5,
  "ratingCount": 12,
  "completedJobs": 15,
  "createdAt": ISODate("2025-09-01T08:00:00.000Z"),
  "updatedAt": ISODate("2025-10-09T14:15:00.000Z")
}
```

---

## 🔄 Data Flow

```
┌─────────────┐
│  Provider   │
│  Profile    │
│   Page      │
└──────┬──────┘
       │
       │ 1. Page loads
       │ useEffect(() => loadProfile())
       │
       ▼
┌──────────────────────────────────┐
│ GET /api/users/me                │
│ Headers: { Authorization: JWT }  │
└───────────┬──────────────────────┘
            │
            │ 2. Backend queries MongoDB
            │
            ▼
┌──────────────────────────────────────┐
│ User.findById(userId)                │
│   .select("-password")               │
│                                      │
│ Returns ALL fields except password: │
│ - name, email, role                 │
│ - licenseImage ✅                   │
│ - licenseType ✅                    │
│ - licenseNumber ✅                  │
│ - onboardingStatus ✅               │
│ - verificationSubmittedAt ✅        │
│ - verificationReviewedAt ✅         │
│ - rejectionReason ✅                │
└───────────┬──────────────────────────┘
            │
            │ 3. Return to frontend
            │
            ▼
┌──────────────────────────────────┐
│ Frontend receives:               │
│ { user: { ...all fields } }      │
└───────────┬──────────────────────┘
            │
            │ 4. Update state & AuthContext
            │ setUser(userData)
            │
            ▼
┌──────────────────────────────────┐
│ React Component Renders:         │
│                                  │
│ {user?.role === 'provider' && (  │
│   <div>                          │
│     <h3>License Status</h3>      │
│     <img src={user.licenseImage}/>│
│     <p>{user.licenseType}</p>    │
│     ...                          │
│   </div>                         │
│ )}                               │
└──────────────────────────────────┘
```

---

## 🧪 How to Verify Data in MongoDB

### Method 1: MongoDB Compass
1. Connect to your MongoDB instance
2. Navigate to database (likely `localhands` or `test`)
3. Click on `users` collection
4. Filter: `{ role: 'provider' }`
5. Look for fields:
   - `licenseImage`
   - `licenseType`
   - `licenseNumber`
   - `onboardingStatus`
   - `verificationSubmittedAt`

### Method 2: MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Use your database
use localhands

# Find a provider with license
db.users.findOne(
  { role: 'provider', licenseImage: { $exists: true } },
  { 
    name: 1,
    email: 1,
    licenseImage: 1,
    licenseType: 1,
    licenseNumber: 1,
    onboardingStatus: 1,
    verificationSubmittedAt: 1,
    verificationReviewedAt: 1,
    rejectionReason: 1
  }
)
```

### Method 3: Backend API (Thunder Client/Postman)
```http
GET http://localhost:5000/api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "user": {
    "_id": "68e7899956d2087a05454c70",
    "name": "John Provider",
    "licenseImage": "https://res.cloudinary.com/daoc1mpdc/...",
    "licenseType": "aadhar",
    "licenseNumber": "1234-5678-9012",
    "onboardingStatus": "approved",
    ...
  }
}
```

### Method 4: Browser Console (Logged in as Provider)
```javascript
// In browser console on Profile page
console.log('User data:', user);

// Should show:
// {
//   name: "John Provider",
//   licenseImage: "https://res.cloudinary.com/...",
//   licenseType: "aadhar",
//   ...
// }
```

---

## ✅ Confirmation Checklist

- [x] License fields added to User model schema
- [x] Fields are stored in MongoDB (not just frontend state)
- [x] Backend API returns license fields (via `/api/users/me`)
- [x] Frontend displays license data in Profile page
- [x] Only visible to providers (role check)
- [x] Shows different UI for approved/rejected/pending
- [x] Image is clickable and opens full size
- [x] Dark mode compatible
- [x] Responsive design

---

## 🎯 Answer to Your Question

**Q: Are these being stored in MongoDB?**  
**A: YES! ✅**

The license data is stored in the **`users` collection** in MongoDB with the following fields:
- `licenseImage` (String) - Cloudinary URL
- `licenseType` (String) - Enum: aadhar/pan/driving_license/other
- `licenseNumber` (String) - License number
- `onboardingStatus` (String) - Enum: pending/approved/rejected
- `verificationSubmittedAt` (Date)
- `verificationReviewedAt` (Date)
- `verificationReviewedBy` (ObjectId)
- `rejectionReason` (String)

All these fields persist in the database and are retrieved when the provider views their profile!
