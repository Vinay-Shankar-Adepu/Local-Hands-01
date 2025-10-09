# 🖼️ Image Upload Setup Guide for License Verification

This guide will help you set up image uploads for the provider license verification feature.

---

## 📋 Table of Contents
1. [Option 1: Cloudinary (Recommended)](#option-1-cloudinary-recommended)
2. [Option 2: Backend Upload with Multer](#option-2-backend-upload-with-multer)
3. [Option 3: AWS S3](#option-3-aws-s3)
4. [Testing the Upload](#testing-the-upload)

---

## Option 1: Cloudinary (Recommended)

Cloudinary is the easiest and most affordable option for image hosting in India.

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Sign up for a free account (10GB storage, 25GB bandwidth/month)
3. After signup, go to Dashboard

### Step 2: Get Your Credentials

From your Cloudinary Dashboard, note down:
- **Cloud Name**: e.g., `dxy1234abc`
- **API Key**: e.g., `123456789012345`
- **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz`

### Step 3: Create Upload Preset

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `localhands_licenses`
   - **Signing Mode**: **Unsigned** (for direct client upload)
   - **Folder**: `localhands/licenses`
   - **Resource type**: Image
   - **Access mode**: Public
   - **Unique filename**: ✅ Enabled
5. Click **Save**

### Step 4: Update Frontend Code

Open `frontend/src/components/ProviderVerification.jsx` and update line ~84:

```javascript
// Replace YOUR_CLOUD_NAME with your actual cloud name
const response = await fetch(
  'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', // ← Change this
  {
    method: 'POST',
    body: formData,
  }
);
```

**Example:**
```javascript
const response = await fetch(
  'https://api.cloudinary.com/v1_1/dxy1234abc/image/upload',
  {
    method: 'POST',
    body: formData,
  }
);
```

### Step 5: Environment Variables (Optional but Recommended)

Create `frontend/.env` file:
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=dxy1234abc
REACT_APP_CLOUDINARY_UPLOAD_PRESET=localhands_licenses
```

Then update the code:
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: 'POST',
    body: formData,
  }
);
```

### ✅ You're Done! Test the upload.

---

## Option 2: Backend Upload with Multer

If you prefer to handle uploads via your backend (more secure):

### Step 1: Install Dependencies

```bash
cd backend
npm install multer cloudinary
```

### Step 2: Configure Cloudinary in Backend

Create `backend/src/config/cloudinary.js`:
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

### Step 3: Add Environment Variables

Add to `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=dxy1234abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### Step 4: Create Upload Route

Create `backend/src/routes/uploadRoutes.js`:
```javascript
const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Upload license image
router.post(
  '/license',
  requireAuth,
  requireRole('provider'),
  upload.single('license'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'localhands/licenses',
            resource_type: 'image',
            public_id: `license_${req.user.id}_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  }
);

module.exports = router;
```

### Step 5: Register Route

Add to `backend/src/app.js`:
```javascript
const uploadRoutes = require('./routes/uploadRoutes');

// ... other routes
app.use('/api/upload', uploadRoutes);
```

### Step 6: Update Frontend

In `frontend/src/components/ProviderVerification.jsx`, replace the `uploadImage` function (around line 66):

```javascript
const uploadImage = async () => {
  if (!imageFile) {
    setError('Please select an image first');
    return null;
  }

  setUploading(true);
  setError('');

  try {
    const formData = new FormData();
    formData.append('license', imageFile);

    const { data } = await API.post('/upload/license', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.url;
  } catch (err) {
    setError('Failed to upload image: ' + err.message);
    return null;
  } finally {
    setUploading(false);
  }
};
```

---

## Option 3: AWS S3

For enterprise-grade storage:

### Step 1: Install AWS SDK

```bash
cd backend
npm install aws-sdk multer
```

### Step 2: Configure AWS

Create `backend/src/config/aws.js`:
```javascript
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

module.exports = s3;
```

### Step 3: Environment Variables

Add to `backend/.env`:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=localhands-licenses
```

### Step 4: Create Upload Route

Create `backend/src/routes/uploadRoutes.js`:
```javascript
const express = require('express');
const multer = require('multer');
const s3 = require('../config/aws');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/license',
  requireAuth,
  requireRole('provider'),
  upload.single('license'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileName = `licenses/${req.user.id}_${Date.now()}.${req.file.originalname.split('.').pop()}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
      };

      const result = await s3.upload(params).promise();

      res.json({
        success: true,
        url: result.Location,
        key: result.Key,
      });
    } catch (error) {
      console.error('S3 upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  }
);

module.exports = router;
```

---

## Testing the Upload

### 1. Test Direct Upload (Cloudinary Option 1)

1. Start your frontend: `cd frontend && npm start`
2. Login as a provider
3. Go to **Verification** in navbar
4. Select a license type
5. Click the upload area and select an image
6. Click **Submit for Verification**
7. Check browser console for any errors
8. Verify the image appears in your Cloudinary dashboard

### 2. Test Backend Upload (Options 2 & 3)

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Follow same steps as above
4. Check backend console for upload logs
5. Verify image appears in Cloudinary/S3

### 3. Common Issues

**❌ CORS Error:**
```
Access to fetch at 'https://api.cloudinary.com/...' has been blocked by CORS policy
```
**Fix:** Make sure your upload preset is set to **Unsigned** mode in Cloudinary settings.

**❌ 413 Payload Too Large:**
```
Request entity too large
```
**Fix:** Image is larger than 5MB. Compress it or increase the limit.

**❌ Invalid Signature:**
```
Invalid signature
```
**Fix:** Double-check your Cloudinary credentials and upload preset name.

---

## 🎉 Quick Start (Recommended)

**For fastest setup, use Option 1 (Direct Cloudinary Upload):**

1. Create free Cloudinary account
2. Create unsigned upload preset named `localhands_licenses`
3. Update line 84 in `ProviderVerification.jsx` with your cloud name
4. Test upload!

**Total time: ~5 minutes**

---

## 📊 Comparison

| Feature | Cloudinary Direct | Backend Upload | AWS S3 |
|---------|------------------|----------------|--------|
| Setup Time | ⭐⭐⭐⭐⭐ 5 min | ⭐⭐⭐ 15 min | ⭐⭐ 30 min |
| Cost (Free Tier) | 10GB storage | 10GB storage | 5GB storage |
| Security | Good | Excellent | Excellent |
| Bandwidth | 25GB/month | Unlimited | Pay per GB |
| Image Optimization | ✅ Built-in | ✅ Built-in | ❌ Manual |
| Recommended For | Small/Medium apps | Enterprise | Large scale |

---

## 🔒 Security Best Practices

1. **Always validate file types** (backend and frontend)
2. **Set file size limits** (5MB recommended)
3. **Use unsigned presets** only for non-sensitive uploads
4. **Store credentials** in environment variables, never in code
5. **Implement rate limiting** to prevent upload abuse
6. **Scan uploaded files** for malware (optional, advanced)

---

## 📞 Need Help?

- Cloudinary Docs: https://cloudinary.com/documentation
- AWS S3 Docs: https://aws.amazon.com/s3/
- Issues? Check `VERIFICATION_FEATURE_SUMMARY.md`

Happy uploading! 🚀
