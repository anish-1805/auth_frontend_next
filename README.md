# Auth Frontend - Next.js

A modern authentication frontend built with Next.js, TypeScript, and Redux Toolkit.

## Features

- 🔐 **Complete Authentication System**
  - Email/Password signup and login
  - Email verification with OTP
  - Password reset with OTP
  - Google OAuth integration
  - Session management with httpOnly cookies

- 📊 **User Dashboard**
  - Display all users from database
  - Search functionality (by name or email)
  - Alphabetical sorting filter
  - Real-time data updates

- 💬 **Real-time Chat**
  - Socket.IO integration
  - AI-powered chatbot with Google Gemini
  - Authenticated connections

- 🌐 **Internationalization**
  - Multi-language support
  - Client and server-side translations

- 🎨 **Modern UI/UX**
  - Responsive design
  - Toast notifications
  - Form validation with Yup
  - React Hook Form integration

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Forms**: React Hook Form + Yup
- **Styling**: CSS Modules
- **API Client**: Axios
- **Real-time**: Socket.IO Client
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js 20.14.0 or higher
- npm or yarn
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy .env file and update values
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build artifacts

## Project Structure

```
Frontend_next/
├── locale/                  # Internationalization
├── public/                  # Static assets
├── src/
│   ├── app/                # Next.js pages (App Router)
│   ├── components/         # React components
│   ├── config/            # Configuration files
│   ├── constants/         # App constants
│   ├── context/           # React Context
│   ├── hooks/             # Custom hooks
│   ├── interfaces/        # TypeScript interfaces
│   ├── services/          # API services
│   ├── store/             # Redux store
│   ├── styles/            # Global styles
│   ├── utilities/         # Utility functions
│   ├── validationSchemas/ # Form validation
│   ├── views/             # Feature views
│   └── middleware.ts      # Next.js middleware
└── Configuration files
```

## API Proxy

The Next.js app proxies all `/api/*` requests to the backend server. This is configured in `next.config.ts`.

## Authentication Flow

1. User signs up with email/password
2. OTP sent to email for verification
3. User verifies email with OTP
4. User logs in with credentials
5. JWT token stored in httpOnly cookie
6. Protected routes check authentication via middleware

## Features Implementation

### User List Dashboard
- Fetches all users from backend
- Client-side search by name or email
- Alphabetical sorting (A-Z, Z-A)
- Responsive table layout

### Protected Routes
- Middleware checks authentication
- Redirects to login if not authenticated
- Preserves intended destination

### Session Management
- Tokens stored in httpOnly cookies
- Auto-refresh on expiration
- Secure cookie configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
