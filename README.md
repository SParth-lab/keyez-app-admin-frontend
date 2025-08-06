# Admin Frontend - Chat System

A React-based admin panel for managing users and chat functionality.

## Features

### 🔐 Authentication & Security
- ✅ Admin login with form validation
- ✅ Session management with localStorage
- ✅ Protected routes with authentication checks
- ✅ JWT token automatic refresh and error handling

### 💬 Real-time Messaging
- ✅ Live chat interface with real users from backend
- ✅ Firebase real-time messaging integration
- ✅ Fallback to API when Firebase unavailable
- ✅ Message history and conversation management
- ✅ Auto-scroll and message formatting

### 👥 User Management
- ✅ Complete user administration panel
- ✅ User statistics dashboard
- ✅ Search and filter users
- ✅ Bulk user operations
- ✅ Admin role management
- ✅ Pagination for large user lists

### 🎨 User Interface
- ✅ **CRAZY AMAZING UI** with organized CSS structure
- ✅ **Mobile-First Responsive Design** with perfect mobile experience
- ✅ **Advanced Animations** - Slide, fade, bounce, gradient effects
- ✅ **Beautiful Gradient Backgrounds** and glass morphism effects
- ✅ **Perfect Chat Bubbles** with modern styling and animations
- ✅ **Smart Mobile Sidebar** with backdrop and smooth transitions
- ✅ **Custom CSS Variables** for consistent theming
- ✅ **Organized Styles** - Global, Components, Mobile, Animations
- ✅ **Touch-Optimized** with proper touch targets for mobile
- ✅ **Scroll Optimizations** with custom scrollbars and smooth behavior

## Project Structure

```
admin-frontend/
├── public/
├── src/
│   ├── api/                # Axios & backend API logic
│   │   └── api.js
│   ├── components/         # Reusable components
│   │   ├── UserList.jsx
│   │   ├── ChatWindow.jsx
│   │   └── MessageInput.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── ChatPage.jsx
│   ├── firebase/           # Firebase config (placeholder)
│   │   └── firebase.js
│   ├── utils/
│   │   └── auth.js         # Session utilities
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd admin-frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env.local` file in the admin-frontend directory:
   ```bash
   # Backend API URL (defaults to production if not set)
   VITE_API_URL=https://keyez-dev.descube.in/api
   
   # Firebase Configuration (Optional for Real-time Messaging)
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Login page: http://localhost:5173/login
   - Chat page: http://localhost:5173/chat (requires login)

## Backend Integration

The frontend is configured to work with the Keyez backend API deployed at **https://keyez-dev.descube.in/**:

### Authentication
- **Login endpoint:** `POST /api/auth/login`
- **Profile endpoint:** `GET /api/auth/profile`
- **Expected response:** `{ user: { username, isAdmin: true }, token }`
- **Admin check:** Only users with `isAdmin: true` can access the chat panel

### Chat Endpoints
- **Send message:** `POST /api/chat/send`
- **Get conversation:** `GET /api/chat/messages/:userId`
- **Get conversations:** `GET /api/chat/conversations`
- **Get sent messages:** `GET /api/chat/sent`
- **Get received messages:** `GET /api/chat/received`

### User Management (Admin Only)
- **Get all users:** `GET /api/users`
- **Get user by ID:** `GET /api/users/:id`
- **Update user:** `PUT /api/users/:id`
- **Delete user:** `DELETE /api/users/:id`
- **Get statistics:** `GET /api/users/stats/overview`
- **Bulk operations:** `POST /api/users/bulk`

## Authentication Flow

1. User enters username/password
2. Form validation (non-empty fields)
3. POST request to `/api/auth/login`
4. Check if user is admin (`isAdmin: true`)
5. Store token and user data in localStorage
6. Redirect to chat page
7. Protected routes check authentication status

## Components

### LoginPage.jsx
- Username/password form
- Form validation
- API integration
- Error handling
- Loading states

### ChatPage.jsx
- User list sidebar
- Chat window
- Message input
- Authentication checks
- Logout functionality

### UserList.jsx
- Display all users
- Online/offline status
- User selection
- Visual feedback

### ChatWindow.jsx
- Message display
- Auto-scroll to bottom
- Sender identification
- Timestamp formatting

### MessageInput.jsx
- Text input with auto-resize
- Send on Enter key
- Message validation

## API Configuration

The `src/api/api.js` file includes:
- Axios instance with interceptors
- Automatic token attachment
- Error handling for 401 responses
- Ready-to-use API methods

## Session Management

The `src/utils/auth.js` provides:
- `getCurrentUser()` - Get user from localStorage
- `setCurrentUser(user)` - Store user data
- `isAuthenticated()` - Check auth status
- `loginUser(userData, token)` - Login helper
- `logoutUser()` - Clear session

## Development Notes

- Uses inline styles for immediate styling without CSS dependencies
- Responsive design principles
- Form validation and error handling
- Protected routing
- Mock data for testing (can be replaced with real API calls)

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

The build files will be in the `dist/` directory.

### Backend Connection

The frontend is configured to connect to the production backend:

- **Production API**: https://keyez-dev.descube.in/
- **API Endpoints**: https://keyez-dev.descube.in/api/
- **Health Check**: https://keyez-dev.descube.in/health

### Environment Configuration

The app automatically uses the production API. You can override this by setting:

```bash
VITE_API_URL=https://your-custom-api-url.com/api
```

### Testing Production Connection

You can test the backend connection at: https://keyez-dev.descube.in/

Expected response:
```json
{
  "message": "Welcome to the API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "users": "/api/users",
    "chat": "/api/chat"
  }
}
```