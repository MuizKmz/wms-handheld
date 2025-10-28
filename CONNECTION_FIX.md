# Handheld Backend Connection Fix

## Problem
- Handheld app showing "cannot POST /auth/login" error
- Connection timeout errors to old server (10.0.10.61:9040)

## Root Causes Identified
1. **Wrong Server IP**: `.env.development` pointed to old server `10.0.10.61:9040`
2. **Missing `/api` Prefix**: Backend has global prefix `/api` but endpoints were calling `/auth/login` instead of `/api/auth/login`

## Fixes Applied

### 1. Updated Environment Configuration
**File**: `wms-handheld/.env.development`
```env
VITE_API_BASE_URL=http://172.19.1.22:3000
VITE_IMG_BASE_URL=http://172.19.1.22:3000
VITE_APP_URL=http://172.19.1.22:3000
VITE_WSS_BASE_URL=ws://172.19.1.22:3000
```

### 2. Fixed API Endpoints
**File**: `wms-handheld/src/api/auth/index.js`
- Changed: `/auth/login` → `/api/auth/login`
- Changed: `/auth/users/${id}` → `/api/auth/users/${id}`

**File**: `wms-handheld/src/api/epc/index.js`
- Changed: `/epc/code/${epcCode}` → `/api/epc/code/${epcCode}`
- Changed: `/epc/code/${epcCode}/status` → `/api/epc/code/${epcCode}/status`
- Changed: `/epc/bulk-update-status` → `/api/epc/bulk-update-status`

### 3. Proxy Configuration
**File**: `wms-handheld/vite.config.js`
Added proxy for `/api`, `/auth`, `/epc` endpoints pointing to backend server.

## Testing
✅ Backend connection verified:
```bash
curl http://172.19.1.22:3000/api/auth/login
# Response: 401 Invalid credentials (expected - route works!)
```

## Next Steps
1. **In HBuilderX**:
   - Stop the running app (if active)
   - Clean project: `Run → Clean` or delete `unpackage` folder
   - Rebuild and run the app
   
2. **Test Login**:
   - Use your actual admin email and password
   - Should successfully connect to backend
   
3. **Test Stock Operations**:
   - Stock-in: Scan EPCs → Submit → Verify status updates to RECEIVED
   - Stock-out: Scan EPCs → Submit → Verify status updates to DELIVERED

## Important Notes
- All API routes in the NestJS backend have `/api` prefix (configured in `main.ts`)
- Development builds use `.env.development`
- Production builds use `.env.production`
- Always rebuild after changing `.env` files
