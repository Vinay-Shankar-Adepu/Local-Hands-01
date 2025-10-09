# Hyderabad Test Providers - Documentation

## 🎯 Overview

Successfully created **30 test providers** across Hyderabad with:
- ✅ Variable ratings (3.0★ to 5.0★)
- ✅ Random locations across 21 different areas in Hyderabad
- ✅ Different availability statuses (70% online, 30% offline)
- ✅ Varied experience levels (20-220 completed jobs)

---

## 🔑 Login Credentials

**All Providers:**
- **Email Pattern**: `provider1.hyd@test.com` to `provider30.hyd@test.com`
- **Password**: `pass123`
- **Role**: provider
- **Status**: Verified and Approved

---

## 📊 Distribution Statistics

### By Area (21 locations)
| Area | Providers |
|------|-----------|
| Manikonda | 3 |
| Kokapet | 3 |
| Begum Bazaar | 2 |
| Dilsukhnagar | 2 |
| Mehdipatnam | 2 |
| Secunderabad | 2 |
| Rajendra Nagar | 2 |
| HITEC City | 1 |
| Banjara Hills | 1 |
| SR Nagar | 1 |
| Abids | 1 |
| ...and more | ... |

### By Rating
| Rating Range | Count |
|--------------|-------|
| 5.0★ | 1 provider |
| 4.5-4.9★ | 9 providers |
| 4.0-4.4★ | 10 providers |
| 3.5-3.9★ | 4 providers |
| 3.0-3.4★ | 6 providers |

### By Availability
- 🟢 **Available (Go Live)**: 16 providers (53%)
- 🔴 **Offline**: 14 providers (47%)

---

## 📍 Hyderabad Locations Covered

All providers are distributed across these 30 landmark locations:

1. HITEC City (78.3809, 17.4435)
2. Banjara Hills (78.4382, 17.4239)
3. Jubilee Hills (78.4089, 17.4239)
4. Gachibowli (78.3489, 17.4399)
5. Kondapur (78.3649, 17.4647)
6. Madhapur (78.3912, 17.4483)
7. Kukatpally (78.4089, 17.4948)
8. Miyapur (78.3598, 17.4948)
9. Ameerpet (78.4482, 17.4374)
10. SR Nagar (78.4483, 17.4410)
11. Begumpet (78.4683, 17.4399)
12. Somajiguda (78.4583, 17.4281)
13. Nampally (78.4692, 17.3850)
14. Abids (78.4744, 17.3850)
15. Secunderabad (78.5007, 17.4399)
16. Begum Bazaar (78.4767, 17.3964)
17. LB Nagar (78.5526, 17.3420)
18. Dilsukhnagar (78.5245, 17.3687)
19. Malakpet (78.5026, 17.3754)
20. Charminar (78.4747, 17.3616)
21. Moazzam Jahi Market (78.4767, 17.3850)
22. Mehdipatnam (78.4384, 17.3964)
23. Tolichowki (78.4009, 17.3964)
24. Manikonda (78.3850, 17.4026)
25. Financial District (78.3392, 17.4183)
26. Kokapet (78.3426, 17.4050)
27. Narsingi (78.3426, 17.3850)
28. Rajendra Nagar (78.3926, 17.3750)
29. Attapur (78.4209, 17.3687)
30. Shamshabad (78.4026, 17.2437)

---

## 🧪 Testing Scenarios

### Scenario 1: Test Sorting Algorithms

**Setup:**
1. Login as `customer@test.com` / `pass123`
2. Use test location: **Gachibowli (78.3489, 17.4399)**

**Expected Results:**

**Nearest Mode** 📍:
- Should show Gachibowli/Madhapur/HITEC City providers first
- Then Kondapur, Financial District, Kokapet
- Farthest: Shamshabad, LB Nagar, Charminar

**Highest Rating Mode** ⭐:
- 5.0★ providers first
- Then 4.9★, 4.8★, 4.7★ etc.
- Lowest: 3.0-3.5★ providers

**Balanced Mode** ⚖️:
- Formula: `(distance × 0.7) + ((5 - rating) × 0.3)`
- Should prioritize nearby high-rated providers
- Example: 2km + 4.5★ beats 5km + 5.0★

### Scenario 2: Test Distance Calculation

**From Gachibowli to:**
- HITEC City: ~4.5 km
- Madhapur: ~2.5 km
- Banjara Hills: ~7 km
- Secunderabad: ~15 km
- Shamshabad: ~25 km

### Scenario 3: Test Availability Filter

**Available Providers**: Should see only 16 providers with 🟢 status
**All Providers**: Turn Go Live off to see all 30

### Scenario 4: Test Rating Distribution

**High Performers (4.5-5.0★)**: 10 providers
- Best for premium service bookings
- Higher price tolerance

**Mid Performers (4.0-4.4★)**: 10 providers
- Balanced quality/price
- Good for standard bookings

**Budget Options (3.0-3.9★)**: 10 providers
- Lower ratings but available
- Price-sensitive customers

---

## 📋 Sample Provider Data

### Provider 1 - High Rating, Available
```
Name: Rohan Prasad
Email: provider1.hyd@test.com
Location: Begum Bazaar (17.3964, 78.4767)
Rating: 4.0★ (136 ratings)
Completed Jobs: 66
Status: 🟢 Available
```

### Provider 2 - Excellent Rating, Offline
```
Name: Suresh Goud
Email: provider2.hyd@test.com
Location: Dilsukhnagar (17.3687, 78.5245)
Rating: 4.9★ (15 ratings)
Completed Jobs: 177
Status: 🔴 Offline
```

### Provider 3 - Good Rating, Available
```
Name: Pradeep Goud
Email: provider3.hyd@test.com
Location: Manikonda (17.4026, 78.385)
Rating: 4.5★ (136 ratings)
Completed Jobs: 166
Status: 🟢 Available
```

---

## 🔄 Re-running the Script

To regenerate providers with different random data:

```bash
cd backend
node src/seed/seedHyderabadProviders.js
```

**What it does:**
- ✅ Deletes all existing `provider*.hyd@test.com` users
- ✅ Creates 30 new providers with random:
  - Ratings (3.0-5.0)
  - Locations (30 Hyderabad landmarks)
  - Availability (70% online, 30% offline)
  - Experience (20-220 jobs)
  - Rating counts (10-160 ratings)

---

## 🎯 Use Cases

### For Testing Sorting:
1. Login as customer
2. Set your location to Gachibowli
3. Toggle between Nearest/Rating/Balanced
4. Verify providers reorder correctly

### For Testing Distance:
1. Note your current location
2. Check provider locations
3. Verify distance calculations match Haversine formula
4. Test with different customer locations

### For Testing Availability:
1. Toggle provider Go Live status
2. Verify only available providers show in search
3. Test auto-pause when booking accepted
4. Test location update after service completion

### For Testing Ratings:
1. Complete bookings with different providers
2. Submit various ratings (3-5 stars)
3. Verify average rating recalculates
4. Check rating count increments

---

## 🚨 Important Notes

1. **Email Pattern**: All test providers use `.hyd@test.com` domain
2. **Password**: All use `pass123` (same as other test users)
3. **Auto-Cleanup**: Script deletes old `.hyd@test.com` users before creating new ones
4. **Real Coordinates**: All locations are actual Hyderabad landmarks
5. **Varied Data**: Each run creates different random ratings/availability

---

## 🗄️ MongoDB Query Examples

### View All Test Providers
```javascript
db.users.find({ 
  email: /\.hyd@test\.com$/ 
}, { 
  name: 1, 
  email: 1, 
  rating: 1, 
  location: 1, 
  isAvailable: 1 
}).sort({ rating: -1 })
```

### Find Available Providers
```javascript
db.users.find({ 
  email: /\.hyd@test\.com$/,
  isAvailable: true 
}, { 
  name: 1, 
  rating: 1, 
  location: 1 
})
```

### Find Top Rated Providers
```javascript
db.users.find({ 
  email: /\.hyd@test\.com$/,
  rating: { $gte: 4.5 }
}, { 
  name: 1, 
  email: 1, 
  rating: 1, 
  ratingCount: 1 
}).sort({ rating: -1 })
```

### Find Providers by Area
```javascript
db.users.find({ 
  email: /\.hyd@test\.com$/,
  address: /Gachibowli/i
}, { 
  name: 1, 
  address: 1, 
  rating: 1 
})
```

---

## ✅ Verification Checklist

After running the script, verify:

- [ ] 30 providers created
- [ ] All have `.hyd@test.com` emails
- [ ] Ratings between 3.0-5.0
- [ ] Locations across different Hyderabad areas
- [ ] ~70% available, ~30% offline
- [ ] Can login with `pass123`
- [ ] Sorting works with different modes
- [ ] Distance calculations accurate

---

**Created on**: October 9, 2025  
**Script**: `backend/src/seed/seedHyderabadProviders.js`  
**Status**: ✅ Ready for testing
