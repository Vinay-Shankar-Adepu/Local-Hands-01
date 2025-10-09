# MongoDB Configuration Summary

**Date:** October 9, 2025

---

## Current MongoDB Instance

You are using **MongoDB Atlas (Cloud Database)** - NOT a local MongoDB installation.

### Connection Details

**Type:** MongoDB Atlas Cloud Cluster  
**Cluster:** `cluster0.pnox5zd.mongodb.net`  
**Database Name:** `localhands`  
**Region:** Shared cluster (free tier)

**Connection String:**
```
mongodb+srv://localhandsservices_db_user:3kyn0aOOp2k1V7EX@cluster0.pnox5zd.mongodb.net/localhands?retryWrites=true&w=majority&appName=Cluster0
```

**Username:** `localhandsservices_db_user`  
**Password:** `3kyn0aOOp2k1V7EX`  

---

## Configuration Location

**File:** `backend/.env`  
**Variable:** `MONGO_URI`

```properties
MONGO_URI=mongodb+srv://localhandsservices_db_user:3kyn0aOOp2k1V7EX@cluster0.pnox5zd.mongodb.net/localhands?retryWrites=true&w=majority&appName=Cluster0
```

---

## Connection Logic

**File:** `backend/src/config/db.js`

```javascript
const uri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;
const conn = await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000
});
console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
```

**Behavior:**
- In **test mode**: Uses `TEST_MONGO_URI` if defined (for isolated test database)
- In **development/production**: Uses `MONGO_URI` (Atlas cluster)
- Logs the connected host on successful connection

---

## Recent Console Output

Based on test runs, the connection shows:
```
✅ MongoDB Connected: ac-fahurhd-shard-00-00.pnox5zd.mongodb.net
✅ MongoDB Connected: ac-fahurhd-shard-00-02.pnox5zd.mongodb.net
```

This confirms connection to **MongoDB Atlas shared cluster nodes**.

---

## Database Collections

Your database `localhands` contains:

### Core Collections
- `users` - Customer, Provider, Admin accounts
- `bookings` - Service requests and job history
- `services` - Provider-created service offerings
- `categories` - Service category groupings
- `servicetemplates` - Admin-managed service templates
- `reviews` - Customer/Provider ratings and feedback
- `notifications` - In-app notification messages
- `counters` - Auto-increment ID sequences

### Seed Data (if seeded)
- **Categories:** 🏠 Home Services, 💇 Personal Services, 🚗 Automotive, 💻 Technology, 🎉 Events
- **Templates:** 20+ service templates (Plumbing, Cleaning, AC Repair, etc.)

---

## Atlas Dashboard Access

**Login URL:** https://cloud.mongodb.com/

**To access your database:**
1. Go to MongoDB Atlas dashboard
2. Sign in with your MongoDB account
3. Navigate to Cluster0
4. Click "Browse Collections" to view data
5. Use "Metrics" tab to monitor performance

---

## Advantages of MongoDB Atlas (Cloud)

✅ **No local installation needed** - Works on any machine with internet  
✅ **Automatic backups** - Point-in-time recovery available  
✅ **High availability** - Replica set with automatic failover  
✅ **Scalable** - Can upgrade from free tier as needed  
✅ **Monitoring** - Built-in performance metrics and alerts  
✅ **Secure** - Network access controls and encryption at rest

---

## Free Tier Limits (M0)

Your current cluster appears to be on the **free tier (M0)**:

- **Storage:** 512 MB
- **RAM:** Shared
- **Connections:** 500 concurrent connections max
- **Bandwidth:** Shared network I/O
- **Backups:** Not included (manual exports only)

**Note:** This is sufficient for development and small-scale testing. For production with many users, consider upgrading to M10+ tier.

---

## Network Access

**Current Status:** Configured to allow connections from your IP address

**To check/modify:**
1. Go to Atlas dashboard
2. Click "Network Access" in left sidebar
3. View IP whitelist entries

**Common configurations:**
- **Single IP:** `123.45.67.89/32` (your home/office IP)
- **Allow from anywhere:** `0.0.0.0/0` (development only - not secure for production!)
- **Cloud deployment IP:** Add your hosting provider's IP range

---

## Alternative: Local MongoDB

If you prefer to use **local MongoDB** for development:

### 1. Install MongoDB Community Edition
**Download:** https://www.mongodb.com/try/download/community

### 2. Update `.env`
```properties
# Comment out Atlas URI:
# MONGO_URI=mongodb+srv://...

# Use local MongoDB:
MONGO_URI=mongodb://127.0.0.1:27017/localhands_dev
```

### 3. Start MongoDB Service
```cmd
# Windows (if installed as service):
net start MongoDB

# Or run manually:
mongod --dbpath C:\data\db
```

### 4. Seed Data
```cmd
cd backend
npm run seed:catalog
npm run seed:users
```

---

## Switching Between Environments

You can maintain multiple configurations:

**Development (Local):**
```properties
MONGO_URI=mongodb://127.0.0.1:27017/localhands_dev
```

**Staging (Atlas):**
```properties
MONGO_URI=mongodb+srv://...@cluster0.pnox5zd.mongodb.net/localhands_staging?...
```

**Production (Atlas):**
```properties
MONGO_URI=mongodb+srv://...@production-cluster.mongodb.net/localhands_prod?...
```

**Testing:**
```properties
TEST_MONGO_URI=mongodb://127.0.0.1:27017/localhands_test
```

---

## Database Tools

### MongoDB Compass (GUI)
**Download:** https://www.mongodb.com/try/download/compass

**Connect using:**
```
mongodb+srv://localhandsservices_db_user:3kyn0aOOp2k1V7EX@cluster0.pnox5zd.mongodb.net/localhands
```

**Features:**
- Visual data browser
- Query builder
- Index management
- Schema analysis
- Export/import data

### MongoDB Shell (CLI)
```bash
mongosh "mongodb+srv://cluster0.pnox5zd.mongodb.net/localhands" --username localhandsservices_db_user
```

---

## Performance Monitoring

**Check connection logs:**
```bash
# Backend server console shows:
✅ MongoDB Connected: ac-fahurhd-shard-00-xx.pnox5zd.mongodb.net
```

**Atlas Metrics (dashboard):**
- Operations per second
- Network I/O
- Connections count
- Query performance

**Application-level monitoring:**
```javascript
// Add to backend/src/config/db.js for debugging:
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to:', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
```

---

## Security Best Practices

### Current Configuration Review

✅ **Credentials in `.env`** - Good! Not hardcoded in source  
⚠️ **`.env` in repository** - Ensure `.gitignore` includes `.env`  
⚠️ **Password complexity** - Consider rotating credentials periodically  
✅ **Connection encryption** - Atlas uses TLS by default  

### Recommendations

1. **Never commit `.env` to Git:**
   ```gitignore
   # backend/.gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use different databases for environments:**
   - Development: `localhands_dev`
   - Production: `localhands_prod`
   - Testing: `localhands_test`

3. **Create separate users with minimal permissions:**
   - Read-only user for analytics
   - Write-only user for specific services
   - Admin user only for migrations

4. **Enable Atlas audit logging** (paid tiers) for compliance

---

## Troubleshooting

### Connection Timeout
**Error:** `MongoServerError: ECONNREFUSED`

**Solutions:**
- Check internet connection
- Verify IP whitelist in Atlas Network Access
- Confirm credentials are correct
- Check if Atlas cluster is paused (free tier auto-pauses after inactivity)

### Authentication Failed
**Error:** `MongoServerError: Authentication failed`

**Solutions:**
- Double-check username/password in `.env`
- Ensure no extra spaces in connection string
- Verify user has proper database permissions in Atlas

### Database Not Found
**Error:** Database or collection doesn't exist

**Solutions:**
- MongoDB creates databases/collections on first write
- Run seed scripts: `npm run seed:catalog`
- Check database name in connection string matches

---

## Summary

🌐 **You are using:** MongoDB Atlas (Cloud)  
📍 **Cluster:** cluster0.pnox5zd.mongodb.net  
💾 **Database:** localhands  
🆓 **Tier:** M0 (Free)  
✅ **Status:** Connected and operational

**Confirmed by console output:**
```
✅ MongoDB Connected: ac-fahurhd-shard-00-02.pnox5zd.mongodb.net
```

---

**Last Updated:** October 9, 2025
