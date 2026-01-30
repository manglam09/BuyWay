# Backend Integration Guide

## Current Status: Using Static Mock Data

The app is currently running with static mock data for development/preview purposes.

---

## When Backend Server is Ready

### Step 1: Update API Base URL
File: `services/api.ts`
```typescript
const API_BASE_URL = 'http://YOUR_SERVER_IP:8080/api';
```

### Step 2: Enable Real API Calls

**For Products:**
File: `services/productService.ts`
```typescript
// Change from:
const USE_REAL_API = false;

// To:
const USE_REAL_API = true;
```

**For Authentication:**
File: `services/authService.ts`
- Already configured for real API calls
- Just ensure backend is running

---

## Expected API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/signup` | User registration |
| POST | `/auth/logout` | User logout |
| GET | `/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products (supports ?category, ?search, ?page, ?limit) |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Add new product (Admin) |
| PUT | `/products/:id` | Update product (Admin) |
| DELETE | `/products/:id` | Delete product (Admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get dashboard stats |
| GET | `/admin/orders` | Get all orders |

---

## Expected Response Formats

### Product Object
```json
{
    "id": "string",
    "name": "string",
    "description": "string",
    "price": number,
    "originalPrice": number | null,
    "image": "string (URL)",
    "category": "string",
    "rating": number,
    "reviews": number,
    "inStock": boolean,
    "badge": "new" | "sale" | "trending" | null
}
```

### Login Response
```json
{
    "token": "string (JWT)",
    "user": {
        "id": "string",
        "email": "string",
        "name": "string",
        "role": "user" | "admin"
    }
}
```

### Stats Response
```json
{
    "totalProducts": number,
    "totalOrders": number,
    "totalRevenue": number,
    "totalUsers": number,
    "pendingOrders": number,
    "lowStock": number
}
```

---

## Adding Route Protection (After Backend Integration)

Once authentication works, protect routes by checking user role:

```typescript
// In _layout.tsx or route components
import { authService } from '../services/authService';

// Redirect non-admin users from admin routes
const user = await authService.getCurrentUser();
if (!user || user.role !== 'admin') {
    router.replace('/');
}
```

---

## Files to Modify When Backend is Ready

1. `services/api.ts` - Update BASE_URL
2. `services/productService.ts` - Set USE_REAL_API = true
3. `app/(user)/home.tsx` - Replace mockProducts with productService calls
4. `app/(admin)/dashboard.tsx` - Replace mockProducts/mockStats with service calls
5. `app/_layout.tsx` - Add auth check for protected routes

---

## Quick Test

Use the "Test API" button on the splash screen to verify backend connectivity before enabling real API calls.
