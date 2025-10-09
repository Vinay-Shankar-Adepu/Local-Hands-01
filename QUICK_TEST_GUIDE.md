# Quick Test Script - Verify All Features

## Run Backend
```bash
cd backend
npm start
```

## Run Frontend
```bash
cd frontend
npm start
```

## Test Users
- **Admin**: admin@gmail.com / admin123
- **Providers**: 1@gmail.com, 2@gmail.com, 3@gmail.com, 4@gmail.com / pass123
- **Customer**: customer@test.com / pass123

## Quick Verification Steps

### 1. Test Sorting (2 minutes)
```
✓ Login as customer@test.com
✓ Go to Browse Services
✓ See 3 buttons: [Nearest] [Highest Rating] [Balanced]
✓ Click each button
✓ Verify services re-order
✓ Default is "Balanced" (middle button active)
```

### 2. Test Go Live (3 minutes)
```
✓ Login as 1@gmail.com (provider)
✓ Check "Go Live" toggle is OFF
✓ Toggle it ON
✓ Verify no error
✓ Create a test booking (from customer account)
✓ Accept booking as provider
✓ Check "Go Live" auto-turned OFF
✓ Complete service
✓ Toggle "Go Live" ON again
```

### 3. Test Timeout (15 seconds)
```
✓ Ensure 2+ providers are Go Live
✓ Create booking as customer
✓ DON'T accept from first provider
✓ Wait 10 seconds
✓ Check request moved to next provider
```

### 4. Test Location Update (1 minute)
```
✓ Check provider's location in MongoDB:
   db.users.findOne({ email: "1@gmail.com" }, { location: 1 })
   
✓ Note coordinates: e.g., [77.5946, 12.9716]

✓ Create booking at different location: [77.6000, 13.0000]

✓ Complete booking as provider

✓ Re-check provider's location:
   db.users.findOne({ email: "1@gmail.com" }, { location: 1 })
   
✓ Should now be: [77.6000, 13.0000] ← customer's location
```

### 5. Test Rating Auto-Popup (30 seconds)
```
✓ Complete a booking
✓ Verify rating modal appears automatically
✓ Submit 5-star rating with comment
✓ Check provider's rating updated
✓ Check both histories show the review
```

## MongoDB Quick Checks

### Check Provider Location
```javascript
db.users.find({ role: "provider" }, { 
  name: 1, 
  isAvailable: 1, 
  location: 1, 
  lastServiceLocation: 1 
})
```

### Check Booking with Timeout
```javascript
db.bookings.find({
  status: "requested"
}, {
  bookingId: 1,
  providerResponseTimeout: 1,
  offers: 1
}).sort({ createdAt: -1 }).limit(1)
```

### Check Review Linked to Booking
```javascript
db.reviews.find({}, {
  booking: 1,
  customer: 1,
  provider: 1,
  rating: 1,
  comment: 1
}).sort({ createdAt: -1 }).limit(5)
```

## Expected Results

### ✅ Sorting
- **Nearest**: Services sorted by increasing distance
- **Highest Rating**: Services sorted by decreasing rating
- **Balanced**: Hybrid score: (distance × 0.7) + ((5-rating) × 0.3)

### ✅ Timeout
- `OFFER_TIMEOUT_MS = 10 * 1000` in bookingController.js
- Booking moves to next provider after 10 seconds

### ✅ Go Live
- Default: OFF on login
- Auto-pause: When booking accepted
- Auto-update location: When service completed

### ✅ Location Update
- Provider location = Last customer's coordinates after completion
- Stored in: `location` and `lastServiceLocation` fields

### ✅ Rating
- Auto-popup after completion
- Linked to booking._id
- Updates provider.rating and provider.ratingCount

## Troubleshooting

### Sorting buttons not visible?
→ Check CustomerHome.js has the sortBy state and buttons

### Location not updating?
→ Check completeBooking function has the location update code

### Timeout still 2 minutes?
→ Verify OFFER_TIMEOUT_MS = 10 * 1000 (not 2 * 60 * 1000)

### Go Live doesn't pause?
→ Check acceptOffer and acceptBooking have the User.findByIdAndUpdate

## Summary
If all 5 tests pass → **Everything working perfectly!** ✅
