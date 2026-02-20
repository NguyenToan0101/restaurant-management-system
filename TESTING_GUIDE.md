# Testing Guide - Restaurant Management System

## Routes Structure

### Public Routes
- `/` - Landing page (with navbar)
- `/login` - Login page

### Protected Routes (require authentication)
- `/restaurants` - Restaurant selection page
- `/restaurant/:id/*` - Restaurant dashboard with sidebar
  - `/restaurant/:id` - Dashboard overview
  - `/restaurant/:id/menu` - Menu management
  - `/restaurant/:id/orders` - Orders
  - `/restaurant/:id/staff` - Staff management
  - `/restaurant/:id/settings` - Settings
- `/coming-soon` - Coming soon page

## Testing Steps

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```

Backend should start on `http://localhost:8080`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend should start on `http://localhost:5173`

### 3. Test Authentication Flow

1. Open `http://localhost:5173`
2. You should see the landing page
3. Click "Sign In" or go to `/login`
4. Login with test credentials:
   - Email: `admin@example.com`
   - Password: `123`
5. After successful login, you should be redirected to `/restaurants`

### 4. Test Dashboard UI

1. After login, you should see the Restaurant Selection page
2. Click on any restaurant card
3. You should be redirected to `/restaurant/:id` (dashboard)
4. Test the sidebar navigation:
   - Click "Overview" - shows dashboard
   - Click "Menu Management" - shows coming soon
   - Click "Orders" - shows coming soon
   - Click "Staff" - shows coming soon
   - Click "Settings" - shows coming soon
5. Test theme toggle (moon/sun icon in sidebar)
6. Test logout from navbar dropdown

### 5. Test Route Protection

1. Logout from the app
2. Try to access `/restaurants` directly
3. You should be redirected to `/login`
4. Try to access `/restaurant/1` directly
5. You should be redirected to `/login`

### 6. Test Public Route Redirect

1. Login successfully
2. Try to access `/login` again
3. You should be redirected to `/restaurants`

## Mock Data

The app uses mock data from `frontend/src/data/MockData.ts`:
- 3 mock restaurants
- Each restaurant has multiple branches
- Revenue and order statistics

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Response Format
```json
{
  "code": 200,
  "message": "Login successful",
  "result": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "userId": "...",
      "email": "...",
      "username": "...",
      "phone": "...",
      "role": "..."
    }
  }
}
```

## Troubleshooting

### Backend won't start
- Check database connection in `.env`
- Ensure PostgreSQL is running
- Check JWT_SECRET_KEY is set

### Frontend won't compile
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run build`
- Clear node_modules and reinstall if needed

### Login fails
- Check backend logs for errors
- Verify user exists in database
- Check CORS configuration in SecurityConfig
- Verify JWT secret key matches between backend and frontend

### Dashboard not showing
- Check browser console for errors
- Verify routes are configured correctly
- Check authentication state in localStorage (key: `auth-storage`)

## Next Steps

1. Connect dashboard to real API endpoints
2. Implement menu management functionality
3. Implement order management
4. Implement staff management
5. Add real-time updates with WebSocket
6. Add role-based access control
