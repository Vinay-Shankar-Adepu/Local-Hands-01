# ✅ Google Sign-In Role Selection Fix

## Problem
Users signing in with Google were not being properly directed to role selection. They were getting stuck on the Welcome page which expected them to already have a role.

## Root Cause

### 1. LoginPage Google Handler (FIXED)
The Google sign-in success handler in `LoginPage.jsx` was hardcoded to go to `/welcome`:

**Before (WRONG):**
```jsx
const onGoogleSuccess = async (response) => {
  try {
    const idToken = response?.credential;
    await loginWithGoogleIdToken(idToken);
    nav("/welcome"); // ❌ Always goes to welcome, even if no role
  } catch {
    setErr("Google sign-in failed. Please try again.");
  }
};
```

This meant:
- First-time Google users (no role) → Stuck on Welcome page
- Returning Google users (have role) → Welcome page shows correctly

### 2. WelcomePage Assumption (FIXED)
The `WelcomePage.js` assumed users always have a role and would show no buttons if `user.role` was `null`.

## Solution Implemented

### 1. Updated LoginPage Google Handler
**File**: `frontend/src/pages/LoginPage.jsx`

**Fixed Code:**
```jsx
const onGoogleSuccess = async (response) => {
  try {
    const idToken = response?.credential;
    const u = await loginWithGoogleIdToken(idToken);
    // ✅ Use redirectAfterAuth to check if user has role
    redirectAfterAuth(u, nav);
  } catch {
    setErr("Google sign-in failed. Please try again.");
  }
};
```

**What `redirectAfterAuth` does** (from AuthContext):
```jsx
const redirectAfterAuth = (u, nav) => {
  if (!u?.role) nav("/choose-role", { replace: true });  // ✅ No role → role selection
  else nav(`/${u.role}`, { replace: true });              // ✅ Has role → dashboard
};
```

### 2. Enhanced WelcomePage with Auto-Redirect
**File**: `frontend/src/pages/WelcomePage.js`

**Added redirect logic:**
```jsx
export default function WelcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = React.useState(true);

  // ✅ Redirect to role selection if user doesn't have a role
  useEffect(() => {
    if (user && !user.role) {
      navigate("/choose-role", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">You are not logged in.</p>
      </div>
    );
  }

  // ✅ Don't render if user has no role (will redirect)
  if (!user.role) {
    return null;
  }
  
  // ... rest of the component (role-specific content)
}
```

## User Flow Now

### Scenario 1: First-Time Google User (No Role)
```
User clicks "Sign in with Google"
    ↓
Google authentication successful
    ↓
Backend creates user with role: null
    ↓
Frontend: onGoogleSuccess called
    ↓
loginWithGoogleIdToken returns user object
    ↓
redirectAfterAuth checks: user.role === null
    ↓
Redirects to /choose-role
    ↓
RoleSelectPage shows options:
    - "Continue as Customer"
    - "Continue as Provider"
    ↓
User selects role
    ↓
Role saved to backend
    ↓
Redirects to appropriate dashboard
```

### Scenario 2: Returning Google User (Has Role)
```
User clicks "Sign in with Google"
    ↓
Google authentication successful
    ↓
Backend finds existing user with role: "customer"
    ↓
Frontend: onGoogleSuccess called
    ↓
loginWithGoogleIdToken returns user object
    ↓
redirectAfterAuth checks: user.role === "customer"
    ↓
Redirects to /customer (dashboard)
    ↓
User sees their dashboard immediately
```

### Scenario 3: User Manually Goes to /welcome Without Role
```
User with no role navigates to /welcome
    ↓
WelcomePage loads
    ↓
useEffect detects: user.role === null
    ↓
Auto-redirects to /choose-role
    ↓
User selects their role
```

## Backend Support (Already Correct)

### Google Sign-In Endpoint
**File**: `backend/src/controllers/authController.js`

**Function**: `googleSignIn`

```javascript
if (!user) {
  // First-time Google user → no role yet
  user = await User.create({
    name,
    email,
    googleId,
    role: null,  // ✅ No role assigned initially
  });
} else if (!user.googleId) {
  // Existing user, link Google
  user.googleId = googleId;
  await user.save();
}
```

The backend correctly:
- Creates new Google users with `role: null`
- Returns user object with role field
- Frontend can check `user.role` to determine next steps

## Role Selection Page

### Route Configuration
**File**: `frontend/src/App.js`

```jsx
<Route
  path="/choose-role"
  element={
    <ProtectedRoute>
      {user?.role ? (
        <Navigate to="/welcome" replace />
      ) : (
        <RoleSelectPage />
      )}
    </ProtectedRoute>
  }
/>
```

**Logic:**
- If user has role → redirect to /welcome
- If user has no role → show RoleSelectPage
- Page is protected (requires authentication)

### RoleSelectPage Component
**File**: `frontend/src/pages/RoleSelectPage.js`

Provides two buttons:
1. **Continue as Customer** → Sets `role: 'customer'`
2. **Continue as Provider** → Sets `role: 'provider'`

After selection:
- Calls `setRole(selectedRole)` from AuthContext
- Updates backend via `POST /auth/set-role`
- Redirects to appropriate dashboard

## Comparison: All Auth Methods

| Auth Method | First-Time User Flow | Returning User Flow |
|-------------|---------------------|-------------------|
| **Email/Password** | Register → /welcome | Login → /welcome |
| **Google Sign-In** | Login → /choose-role → Dashboard | Login → Dashboard ✅ |
| **WhatsApp OTP** | Register → /choose-role → Dashboard | Login → Dashboard ✅ |

All methods now properly:
- Check if user has role
- Direct to role selection if needed
- Direct to dashboard if role exists

## Files Modified

1. ✅ `frontend/src/pages/LoginPage.jsx`
   - Updated `onGoogleSuccess` to use `redirectAfterAuth`
   - Now checks user role before navigation

2. ✅ `frontend/src/pages/WelcomePage.js`
   - Added `useEffect` to auto-redirect users without role
   - Prevents rendering welcome content for role-less users
   - Adds null check before showing role-specific buttons

## Testing Checklist

### Test Case 1: New Google User
- [ ] Click "Sign in with Google" on login page
- [ ] Select Google account (never used with app before)
- [ ] Should redirect to `/choose-role`
- [ ] Should see "Continue as Customer" and "Continue as Provider" buttons
- [ ] Select "Customer"
- [ ] Should redirect to `/customer` dashboard
- [ ] Role should be saved (check profile)

### Test Case 2: Existing Google User
- [ ] Click "Sign in with Google" on login page
- [ ] Select Google account (already has role)
- [ ] Should redirect DIRECTLY to dashboard
- [ ] Should NOT see role selection page
- [ ] Should see appropriate dashboard (customer/provider)

### Test Case 3: Manual Navigation
- [ ] Sign in with Google (new user, no role)
- [ ] Manually navigate to `/welcome` in browser
- [ ] Should auto-redirect to `/choose-role`
- [ ] Should not get stuck on welcome page

### Test Case 4: RegisterPage Google (Already Working)
- [ ] Click "Sign up with Google" on register page
- [ ] New user → redirects to `/choose-role`
- [ ] Existing user → redirects to dashboard
- [ ] RegisterPage was already using `redirectAfterAuth` ✅

### Test Case 5: Edge Cases
- [ ] User with role visits `/choose-role` → redirects to `/welcome`
- [ ] User without role visits `/welcome` → redirects to `/choose-role`
- [ ] User logs out → can sign in with Google again
- [ ] Multiple Google accounts → each handled independently

## Benefits

✅ **Consistent Experience**: All auth methods handle role selection properly
✅ **No Dead Ends**: Users without roles are guided to select one
✅ **Smart Routing**: Returning users go straight to dashboard
✅ **Better UX**: No confusion about what to do next
✅ **Data Integrity**: Backend always creates Google users with `role: null` initially

## Related Files

- `frontend/src/context/AuthContext.js` - Contains `redirectAfterAuth` helper
- `frontend/src/pages/RoleSelectPage.js` - Role selection UI
- `backend/src/controllers/authController.js` - Google sign-in endpoint
- `frontend/src/App.js` - Route configuration

---

**Status**: ✅ **FIXED** - Google sign-in users are now properly directed to role selection if they don't have a role, and straight to dashboard if they do!
