# 🧪 LocalHands API - Complete Flow Testing Guide

## 📋 Overview

This Postman collection tests the **complete end-to-end flow** of the LocalHands application, covering both Customer and Provider journeys.

---

## 🚀 Quick Start

### 1. Prerequisites

- ✅ Backend server running on `http://localhost:5001`
- ✅ MongoDB connected
- ✅ Service catalog seeded (categories & templates)
- ✅ Postman installed

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

**Verify server is running:**
```bash
curl http://localhost:5001/
```

### 3. Seed Service Catalog (if not done)

```bash
cd backend
node src/seed/seedCatalog.js
```

### 4. Import Postman Collection

1. Open **Postman**
2. Click **Import** (top left)
3. Select file: `LocalHands_Complete_Flow_Test.postman_collection.json`
4. Collection imported! ✅

---

## 🎯 How to Run Tests

### Option 1: Run Entire Collection (Recommended)

1. Click on **"LocalHands - Complete Flow Test"** collection
2. Click **"Run"** button (top right)
3. Select all 24 requests
4. Click **"Run LocalHands - Complete Flow Test"**
5. Watch tests execute sequentially ✨

**Expected Duration:** ~30-60 seconds

### Option 2: Run Individual Requests

Click through each request manually to see detailed responses.

---

## 📊 Test Flow Structure

### **Phase 1: Setup (Tests 1-6)**
1. ✅ Health Check - Verify server is running
2. ✅ Register Customer - Create new customer account
3. ✅ Set Customer Role - Assign customer role
4. ✅ Register Provider - Create new provider account
5. ✅ Set Provider Role - Assign provider role
6. ✅ Admin Login - Test admin authentication

### **Phase 2: Service Configuration (Tests 7-11)**
7. ✅ Get Categories - Fetch service categories
8. ✅ Get Service Templates - Fetch available services
9. ✅ Provider Select Services - Provider chooses services to offer
10. ✅ Provider Update Location - Set provider GPS coordinates
11. ✅ Provider Go Live - Enable availability for bookings

### **Phase 3: Booking Flow (Tests 12-14)**
12. ✅ Customer Create Booking - Customer requests a service
13. ✅ Provider Check Pending Offers - Provider sees offer notification
14. ✅ Provider Accept Offer - Provider accepts the job
15. ✅ Customer Check Booking Status - Verify booking assigned

### **Phase 4: Service Execution (Tests 15-17)**
16. ✅ Provider Complete Job - Provider marks job as done
17. ✅ Customer Confirm Completion - Customer confirms completion

### **Phase 5: Reviews & Ratings (Tests 18-20)**
18. ✅ Customer Rate Provider - Customer submits 5-star review
19. ✅ Provider Rate Customer - Provider rates customer
20. ✅ Verify Provider Rating Updated - Check rating calculation

### **Phase 6: Additional Features (Tests 21-24)**
21. ✅ Provider Go Offline - Disable availability
22. ✅ Search Nearby Providers - Test geospatial search
23. ✅ Get Customer Notifications - Check notification system
24. ✅ Get Provider Notifications - Verify provider notifications

---

## 🔑 Collection Variables

The collection uses **automatic variable management**. Tokens and IDs are saved automatically:

| Variable | Description | Set By |
|----------|-------------|--------|
| `baseUrl` | API base URL | Manual (default: `http://localhost:5001/api`) |
| `customerToken` | Customer JWT token | Auto (Test 2) |
| `providerToken` | Provider JWT token | Auto (Test 4) |
| `adminToken` | Admin JWT token | Auto (Test 6) |
| `bookingId` | Created booking ID | Auto (Test 12) |
| `serviceTemplateId` | Service template ID | Auto (Test 8) |
| `categoryId` | Category ID | Auto (Test 7) |
| `customerEmail` | Test customer email | Manual (default: `testcustomer@flow.com`) |
| `providerEmail` | Test provider email | Manual (default: `testprovider@flow.com`) |

**To customize emails:**
1. Click collection name
2. Go to **Variables** tab
3. Edit `customerEmail` and `providerEmail`
4. Click **Save**

---

## ✅ Success Criteria

### **All Tests Should Pass If:**
- ✅ Backend server is running
- ✅ MongoDB is connected
- ✅ Service catalog is seeded
- ✅ All APIs are working correctly

### **Expected Console Output:**
```
✅ Customer Token: eyJhbGciOiJIUzI1NiI...
✅ Customer role set for: Test Customer Flow
✅ Provider Token: eyJhbGciOiJIUzI1NiI...
✅ Provider role set for: Test Provider Flow
✅ Admin logged in: Admin
✅ Categories found: 8
   Sample: Home Services
✅ Templates found: 15
   Selected: House Cleaning - ₹800
✅ Services selected: 1
   Services: House Cleaning
✅ Location updated: [78.4867, 17.385]
✅ Provider is now LIVE
   isAvailable: true
   isLiveTracking: true
✅ Booking created
   Booking ID: BK-2025-10-XXXXX
   Status: requested
   Total: ₹500
   Pending providers: 1
✅ Pending offers: 1
   Booking ID: BK-2025-10-XXXXX
   Customer: Test Customer Flow
✅ Offer accepted
   Status: in_progress
   Auto-paused Go Live: Yes
✅ Customer bookings: 1
   Current Booking:
     Status: in_progress
     Provider: Test Provider Flow
✅ Job completed by provider
   Status: provider_completed
✅ Customer confirmed completion
   Final Status: completed
✅ Review submitted
   Rating: 5/5 ⭐
   Comment: Excellent service! Very professional and on time.
✅ Provider stats verified
   Current Rating: 5/5 ⭐
   Total Reviews: 1
   Completed Jobs: 1
✅ Provider is now OFFLINE
✅ Found 2 nearby providers (within 5km)
```

---

## 🐛 Troubleshooting

### ❌ Test 1 Fails: "Server not running"
**Solution:** Start backend server
```bash
cd backend
npm run dev
```

### ❌ Test 7 Fails: "No categories found"
**Solution:** Seed service catalog
```bash
cd backend
node src/seed/seedCatalog.js
```

### ❌ Test 12 Fails: "No service templates"
**Solution:** Check that Test 8 passed successfully. If not, verify provider selected services.

### ❌ Test 13 Fails: "No pending offers"
**Solution:** 
- Ensure provider is LIVE (Test 11 passed)
- Check booking was created (Test 12 passed)
- Wait a few seconds and retry

### ❌ Test 18/19 Fails: "Review already exists"
**Solution:** This is OK - review was already submitted in a previous run. Tests handle this gracefully.

---

## 🔄 Re-running Tests

### **Clean Run (New Users Each Time):**
The collection automatically creates **new users** with timestamped emails on each run. No cleanup needed!

### **Manual Cleanup (Optional):**
If you want to clean the database:

```bash
# Drop all collections
mongo "mongodb+srv://..." --eval "db.dropDatabase()"

# Re-seed catalog
cd backend
node src/seed/seedCatalog.js
```

---

## 📈 What Gets Tested

### **Authentication & Authorization**
✅ User registration  
✅ Role assignment  
✅ JWT token generation  
✅ Admin login  

### **Service Management**
✅ Category listing  
✅ Service template fetching  
✅ Provider service selection  

### **Location & Availability**
✅ GPS location updates  
✅ Go Live/Offline toggle  
✅ Geospatial nearby search  
✅ Auto-location update after service  

### **Booking Lifecycle**
✅ Booking creation  
✅ Offer notification system  
✅ 10-second timeout mechanism  
✅ Offer acceptance  
✅ Auto-pause Go Live during service  
✅ Job completion (provider)  
✅ Job confirmation (customer)  

### **Reviews & Ratings**
✅ Customer → Provider review  
✅ Provider → Customer review  
✅ Automatic rating recalculation  
✅ Rating count updates  

### **Additional Features**
✅ Notification system  
✅ Booking history  
✅ Provider profile stats  

---

## 📊 Key Features Verified

| Feature | Test # | Status |
|---------|--------|--------|
| **10-second timeout** | 13 | ✅ Verified in offer logic |
| **Auto-pause Go Live** | 14 | ✅ isAvailable set to false on accept |
| **Location update post-service** | 16 | ✅ Provider location → customer location |
| **Sorting (Nearest/Rating/Balanced)** | - | Frontend only |
| **Mutual ratings** | 18-19 | ✅ Both directions work |
| **Geospatial search** | 22 | ✅ 5km radius search |

---

## 🎉 Success Metrics

### **Complete Flow Success:**
- ✅ **24/24 tests pass**
- ✅ Booking created → accepted → completed
- ✅ Reviews submitted both ways
- ✅ Provider rating updated
- ✅ All features working

### **Performance:**
- ⏱️ Total execution time: < 60 seconds
- ⏱️ Average API response: < 500ms
- ⏱️ Database operations: < 200ms

---

## 📝 Notes

1. **Dynamic Emails:** Collection uses `customer_${timestamp}@test.com` format to avoid duplicates
2. **Auto Token Management:** All JWT tokens saved automatically in collection variables
3. **Idempotent Tests:** Most tests can be re-run safely (reviews might show "already exists")
4. **Console Logs:** Check Postman console for detailed output from each test
5. **Timestamps:** Booking scheduled time is auto-calculated (2 hours from now)

---

## 🚀 Next Steps

After successful testing:

1. ✅ **Deploy to staging** - Test with production-like data
2. ✅ **Load testing** - Use Postman Runner with 100+ iterations
3. ✅ **Integration tests** - Add to CI/CD pipeline
4. ✅ **Monitor performance** - Add response time assertions
5. ✅ **Security testing** - Test unauthorized access attempts

---

## 📞 Support

If tests fail consistently:
1. Check backend logs for errors
2. Verify MongoDB connection
3. Ensure all dependencies installed (`npm install`)
4. Check environment variables in `.env`

---

**Happy Testing! 🎉**
