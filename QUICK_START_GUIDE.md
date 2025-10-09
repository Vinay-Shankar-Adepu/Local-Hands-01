# Quick Start Guide - LocalHands Platform

## Prerequisites
- Node.js v16+ installed
- MongoDB running (local or cloud Atlas)
- Git installed

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install all required packages including:
- `socket.io` - Real-time communication
- `express` - Web server
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Authentication

### 2. Configure Environment

Create `.env` file in `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/localhands_dev
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Optional feature flags
OFFER_TIMEOUT_MS=10000
STRICT_TEST_LIVE_ENFORCE=0
ALLOW_OFFLINE_MATCH=0
SHOW_RANKED_PREVIEW=0
```

**For MongoDB Atlas (cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/localhands?retryWrites=true&w=majority
```

### 3. Seed Initial Data (Optional but Recommended)

```bash
# Seed service catalog (categories and templates)
npm run seed:catalog

# OR run all seeds
npm run seed:users
npm run seed:providers
npm run seed:catalog
```

### 4. Start Backend Server

**Development mode (auto-restart on changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

**Verify backend is running:**
```bash
curl http://localhost:5000
# Expected: "🚀 LocalHands API (app export)"

curl http://localhost:5000/api/catalog
# Expected: JSON with service categories
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file in `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

**For production deployment:**
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
```

### 3. Start Frontend

```bash
npm start
```

Frontend will start on `http://localhost:3000` and automatically open in your browser.

---

## Common Issues & Fixes

### Issue 1: "Cannot find package 'socket.io'"

**Solution:**
```bash
cd backend
npm install
```

The `package.json` already includes `socket.io`, you just need to install dependencies.

---

### Issue 2: "MongoDB connection error"

**Symptoms:**
```
❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

**Option A: Start local MongoDB**
```bash
# Windows (if installed as service):
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod
# OR
mongod --dbpath /path/to/data/db
```

**Option B: Use MongoDB Atlas (cloud)**
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `.env` with Atlas URI

---

### Issue 3: Popular Services Not Showing

**Check 1:** Backend catalog seeded?
```bash
cd backend
npm run seed:catalog
```

**Check 2:** API responding?
```bash
curl http://localhost:5000/api/catalog
```

**Check 3:** Frontend pointing to correct API URL?
```javascript
// frontend/src/services/api.js should have:
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

---

### Issue 4: CORS Errors

**Symptom:**
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:** Already configured in `backend/src/app.js`:
```javascript
app.use(cors()); // Allows all origins in development
```

If issue persists, explicitly configure:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

### Issue 5: Port Already in Use

**Backend (Port 5000):**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Set different port in frontend/.env:
PORT=3001
```

---

## Running Tests

### Backend Tests

**All tests:**
```bash
cd backend
npm test
```

**Specific test suite:**
```bash
npm test -- src/tests/multiProviderFlow.test.js
```

**With coverage:**
```bash
npm test -- --coverage
```

**Sorting report test:**
```bash
# Windows:
run-sorting-test.bat

# Manual:
set RUN_SORTING_REPORT=1
set SHOW_RANKED_PREVIEW=1
npm test -- src/tests/sorting_dispatch_report.test.js --runInBand
```

---

## Project Structure

```
Local-Hands-01/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation
│   │   ├── utils/          # Helpers, bootstrap
│   │   ├── seed/           # Data seeders
│   │   ├── tests/          # Jest test suites
│   │   ├── app.js          # Express app setup
│   │   └── index.js        # Server entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth, Theme)
│   │   ├── services/       # API client
│   │   ├── utils/          # Helper functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/
│   │   ├── images/         # Static images
│   │   └── index.html
│   ├── package.json
│   └── .env
│
└── Documentation/
    ├── COMPLETE_TESTING_SUMMARY.md
    ├── SORTING_DISPATCH_VERIFICATION_REPORT.md
    ├── POPULAR_SERVICES_FIX.md
    └── QUICK_START_GUIDE.md (this file)
```

---

## User Roles

### 1. Customer
- Browse services
- Create booking requests
- View booking history
- Rate and review providers

### 2. Provider
- Select services to offer
- Go Live/Offline toggle
- Receive and accept booking offers (10s window)
- Complete jobs and relocate

### 3. Admin
- Manage service catalog (categories, templates)
- View all bookings
- Moderate reviews
- Force-advance offer queues (testing)

---

## Default Credentials (After Seeding)

**Admin:**
```
Email: admin@localhands.com
Password: admin123
```

**Test Users (if seed:users run):**
```
Customer: customer@test.com / pass123
Provider: provider@test.com / pass123
```

---

## API Endpoints Overview

### Public
- `GET /api/catalog` - Service templates grouped by category
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Customer (requires auth)
- `POST /api/bookings/create-multi` - Create booking with multi-provider dispatch
- `GET /api/bookings/mine` - View my bookings
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Provider (requires auth)
- `POST /api/providers/select-services` - Select services to offer
- `PATCH /api/providers/go-live` - Enable availability
- `PATCH /api/providers/go-offline` - Disable availability
- `GET /api/bookings/offers/mine` - View pending offers
- `PATCH /api/bookings/:id/offer/accept` - Accept offer
- `PATCH /api/bookings/:id/offer/decline` - Decline offer
- `PATCH /api/bookings/:id/complete` - Mark job complete

### Admin (requires auth)
- `GET /api/admin/...` - Admin dashboard data
- `POST /api/catalog/...` - Manage catalog

---

## Socket Events

### Customer
- `reviewPrompt` - Triggered when provider completes job
- `bookingLocked` - Triggered when provider accepts

### Provider
- `new_request` - New booking request available
- `reviewPrompt` - Triggered when customer completes job
- `offerExpired` - Offer timeout (10 seconds elapsed)

---

## Next Steps

1. ✅ Install dependencies (`npm install` in both folders)
2. ✅ Configure `.env` files
3. ✅ Start MongoDB
4. ✅ Seed catalog (`npm run seed:catalog`)
5. ✅ Start backend (`npm run dev`)
6. ✅ Start frontend (`npm start`)
7. 🎉 Test the platform!

---

## Recommended Development Workflow

### Day-to-Day Development

1. **Terminal 1:** Backend server
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2:** Frontend server
   ```bash
   cd frontend
   npm start
   ```

3. **Terminal 3:** Tests (when needed)
   ```bash
   cd backend
   npm test -- --watch
   ```

### Before Committing

```bash
# Run tests
cd backend
npm test

# Check for linting (if configured)
npm run lint

# Build frontend to verify
cd ../frontend
npm run build
```

---

## Production Deployment

### Backend (Node.js)

**Platforms:** Heroku, Railway, Render, AWS, DigitalOcean

**Example (Heroku):**
```bash
cd backend
heroku create localhands-api
heroku config:set MONGO_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="production-secret"
git push heroku main
```

### Frontend (React)

**Platforms:** Vercel, Netlify, AWS S3 + CloudFront

**Example (Netlify):**
```bash
cd frontend
npm run build
# Deploy dist/ folder via Netlify dashboard or CLI
```

**Build command:** `npm run build`  
**Publish directory:** `build`

---

## Support & Documentation

- **Testing Report:** `COMPLETE_TESTING_SUMMARY.md`
- **Sorting Algorithm:** `SORTING_DISPATCH_VERIFICATION_REPORT.md`
- **Recent Fixes:** `POPULAR_SERVICES_FIX.md`

---

**Last Updated:** October 9, 2025  
**Platform Version:** LocalHands v1.0 (TALQS)
