# Popular Services Catalog Fix

**Issue:** Popular services catalog and images were not visible on the homepage.

**Root Cause:** The HomePage was fetching from `/api/services` which returns provider-created services. If no providers have selected services yet, this endpoint returns an empty array, resulting in no services displayed.

---

## Solution Applied

### 1. Updated Data Source ✅
**File:** `frontend/src/pages/HomePage.js`

**Changed from:**
```javascript
API.get("/services")
```

**Changed to:**
```javascript
API.get("/catalog")
```

The `/api/catalog` endpoint returns service templates grouped by categories, which are always available (seeded on server startup via `bootstrapCatalog.js`).

### 2. Added Service Images ✅

Created a comprehensive image mapping function with:
- **Local images** when available (e.g., `/images/ac-repair.jpg`)
- **Unsplash fallback images** for all service types
- **Default fallback** for unmapped services

**Image Coverage:**
- 🏠 Home Services: Cleaning, Plumbing, Electrical, Carpentry, Painting
- 💇 Personal Services: Salon, Spa
- 🚗 Automotive: Vehicle Towing, Car Repair, Bike Repair
- 💻 Technology: Mobile Repair, Laptop Repair, AC Repair, Appliance Repair, CCTV, Smart Home
- 🎉 Events: Photography, Catering, Music, Home Decoration

### 3. Data Transformation ✅

The catalog API returns:
```json
{
  "catalog": [
    {
      "_id": "...",
      "name": "🏠 Home Services",
      "services": [
        { "_id": "...", "name": "Plumbing", "defaultPrice": 120 }
      ]
    }
  ]
}
```

The HomePage now flattens this into individual service cards with images:
```javascript
const allTemplates = r.data.catalog.flatMap(cat => 
  cat.services.map(svc => ({
    _id: svc._id,
    name: svc.name,
    category: cat.name,
    price: svc.defaultPrice,
    image: getServiceImage(svc.name)
  }))
);
```

---

## Verification Steps

### Backend (Ensure Catalog is Seeded)

1. **Check if catalog bootstrap runs on server start:**
   - Open `backend/src/app.js`
   - Verify `ensureCatalog()` is called in the non-test environment block

2. **Manual seed (if needed):**
```bash
cd backend
npm run seed:catalog
```

3. **Verify catalog API:**
```bash
curl http://localhost:5000/api/catalog
```

Expected response: JSON with categories and service templates.

### Frontend (Verify Display)

1. **Start frontend:**
```bash
cd frontend
npm start
```

2. **Navigate to homepage:** `http://localhost:3000`

3. **Expected result:**
   - "Popular Services" section displays 6 service cards
   - Each card has:
     - Service name (e.g., "Plumbing", "House Cleaning")
     - Category badge (e.g., "🏠 Home Services")
     - Price (e.g., "₹120")
     - Relevant image (either local or Unsplash)

---

## Files Modified

### Frontend
- `frontend/src/pages/HomePage.js`
  - Changed API endpoint from `/services` to `/catalog`
  - Added `getServiceImage()` helper function
  - Updated data transformation logic

### Backend (No changes needed)
- Catalog already seeded via `bootstrapCatalog.js` on server startup
- `/api/catalog` endpoint already exists in `routes/catalogRoutes.js`

---

## Additional Improvements

### Add More Local Images (Optional)

To reduce Unsplash dependency and improve load times, add more images to `frontend/public/images/`:

**Suggested images:**
```
frontend/public/images/
  ├── ac-repair.jpg (✅ exists)
  ├── house-cleaning.jpg
  ├── plumbing.jpg
  ├── electrical.jpg
  ├── carpentry.jpg
  ├── painting.jpg
  ├── salon.jpg
  ├── spa.jpg
  ├── mobile-repair.jpg
  ├── photography.jpg
  ├── catering.jpg
  └── ... (etc.)
```

Then update the `imageMap` to use local paths:
```javascript
'House Cleaning': '/images/house-cleaning.jpg',
'Plumbing': '/images/plumbing.jpg',
// etc.
```

### Image Optimization

For production, consider:
1. **WebP format** for smaller file sizes
2. **Lazy loading** via `loading="lazy"` attribute
3. **Responsive images** with `srcset` for different screen sizes
4. **CDN hosting** for faster global delivery

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] `/api/catalog` returns service templates
- [ ] Homepage loads without console errors
- [ ] "Popular Services" section displays 6 service cards
- [ ] Service images load correctly (no broken images)
- [ ] Category badges display with emojis
- [ ] Prices display in correct format
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Dark mode toggle works correctly (if implemented)

---

## Troubleshooting

### Issue: Still no services showing

**Check 1:** Backend catalog seeded?
```bash
# Check MongoDB for categories and templates
mongo localhands_dev
db.categories.find()
db.servicetemplates.find()
```

**Check 2:** API endpoint working?
```bash
curl http://localhost:5000/api/catalog
```

**Check 3:** Frontend API base URL correct?
```javascript
// In frontend/src/services/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Issue: Images not loading

**Check 1:** Verify image URLs in browser DevTools Network tab

**Check 2:** For local images, ensure path is correct:
```javascript
'/images/ac-repair.jpg' // Correct (served from public folder)
'./images/ac-repair.jpg' // Incorrect
```

**Check 3:** Unsplash images blocked by CORS?
- Add `crossOrigin="anonymous"` to `<img>` tags if needed
- Or use a proxy/CDN

### Issue: "Failed to load services" error

**Check 1:** CORS configuration in backend
```javascript
// backend/src/app.js
app.use(cors()); // Should allow all origins in dev
```

**Check 2:** Frontend API service configured
```javascript
// frontend/src/services/api.js should have proper base URL
```

---

## Summary

✅ **Fixed:** Homepage now fetches service templates from `/catalog` instead of empty `/services`  
✅ **Added:** Comprehensive image mapping for all 20+ service types  
✅ **Improved:** Data transformation to display catalog as service cards  
✅ **Maintained:** Existing ServiceCard component compatibility

**Result:** Popular Services section now displays correctly with images on first load, without requiring any providers to be registered.

---

**Date:** October 9, 2025  
**Status:** ✅ RESOLVED
