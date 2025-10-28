# Handheld RBAC Integration Fix

## Problem
The handheld app showed only user info but no stock management modules (Stock In, Stock Out, Receiving, etc.) because:
1. Backend wasn't returning `permissionList` in login response
2. No permissions were seeded in the database
3. Frontend uses `$hasPermission()` helper to show/hide modules based on permissions

## Changes Made

### 1. Backend - User Service (`wms-backend/src/modules/user/user.service.ts`)
Updated `validateUser` method to:
- Load user with role and role permissions (including permission details)
- Build `permissionList` array in format matching handheld expectations
- Return `permissionList` with user object

**Permission Format**:
- Simple: `module:resource` (e.g., `handheld:search`)
- Complex: `module:resource:action` (e.g., `handheld:stock-in:epc`)

### 2. Backend - User Controller (`wms-backend/src/modules/user/user.controller.ts`)
Updated `login` method to include `permissionList` in response:
```typescript
return {
  token: result.access_token,
  user: {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
    permissionList: user.permissionList, // ← Added
  }
};
```

### 3. Database - Permissions Seed (`wms-backend/prisma/seed-handheld-permissions.sql`)
Created SQL script to seed handheld permissions:
- `handheld:search` - Search products
- `handheld:receiving` - Receiving module
- `handheld:stock-in:epc` - Stock in with EPC scanning
- `handheld:stock-in:tid` - Stock in with TID scanning
- `handheld:stock-out` - Stock out operations
- `handheld:stock-take` - Stock take operations
- `handheld:stock-return` - Stock return operations

All permissions assigned to Admin role by default.

## How It Works

### Frontend Permission Check
File: `wms-handheld/src/utils/kit/permission.js`
```javascript
const hasPermission = (perm) => {
    const userStore = useUserStore()
    let permissionSet = new Set(userStore.info?.permissionList || [])
    return permissionSet.has(perm)
}
```

### Module Visibility
File: `wms-handheld/src/views/index.vue`
```vue
<div v-if="$hasPermission('handheld:search')" class="module">
  <!-- Search module -->
</div>
<div v-if="$hasPermission('handheld:stock-in:epc')" class="module">
  <!-- Stock In EPC module -->
</div>
```

## Testing Steps

### 1. Restart Backend
```bash
docker restart wms-backend
```

### 2. Test Login API
```bash
curl http://172.19.1.22:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wms.com","password":"Admin@123"}'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@wms.com",
    "fullName": "Admin User",
    "username": "admin",
    "role": "Admin",
    "permissionList": [
      "handheld:search",
      "handheld:receiving",
      "handheld:stock-in:epc",
      "handheld:stock-in:tid",
      "handheld:stock-out",
      "handheld:stock-take",
      "handheld:stock-return"
    ]
  }
}
```

### 3. Test Handheld App
1. **Rebuild in HBuilderX**: Stop app, clean project, rebuild
2. **Login** with admin credentials
3. **Verify**: All stock management modules should now be visible

## Adding New Permissions

### Database (SQL)
```sql
INSERT INTO permissions (module, action, resource, description, created_at) VALUES
('handheld', 'new-action', 'new-resource', 'Description', NOW());

-- Assign to role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Admin' AND p.module = 'handheld' AND p.resource = 'new-resource';
```

### Frontend (Add Permission Check)
```vue
<div v-if="$hasPermission('handheld:new-resource:new-action')" class="module">
  <!-- New module -->
</div>
```

## Permission Schema

**Database Structure** (`permissions` table):
| Column | Type | Example |
|--------|------|---------|
| module | VARCHAR(50) | `handheld` |
| action | VARCHAR(50) | `epc`, `tid`, or empty |
| resource | VARCHAR(50) | `search`, `stock-in`, `stock-out` |
| description | VARCHAR(255) | Human-readable description |

**Format in permissionList**:
- With action: `{module}:{resource}:{action}` → `handheld:stock-in:epc`
- Without action: `{module}:{resource}` → `handheld:search`

## Troubleshooting

### Modules Still Not Showing
1. ✅ Check backend logs for errors during login
2. ✅ Verify permissions exist in database: `SELECT * FROM permissions WHERE module = 'handheld'`
3. ✅ Verify role has permissions: `SELECT * FROM role_permissions WHERE role_id = 1`
4. ✅ Check user's role: `SELECT * FROM users WHERE email = 'admin@wms.com'`
5. ✅ Inspect login response in browser/handheld network tab
6. ✅ Check `userStore.info.permissionList` in Vue DevTools

### Permission Check Failing
1. ✅ Verify permission string format matches database format exactly
2. ✅ Check for typos in permission names
3. ✅ Ensure user is logged in and user store is populated

## Next Steps
1. **Restart backend container** to load new code changes
2. **Test login** to verify permissionList in response
3. **Rebuild handheld app** in HBuilderX
4. **Login and verify** all modules are visible
5. **Configure permissions** for other roles (Warehouse Staff, Manager, etc.)
