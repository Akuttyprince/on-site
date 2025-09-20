# AI Productivity App

A modern React application with Google OAuth authentication, MongoDB integration, and user profile management for event organizing and productivity tools.

## Features

- 🚀 Modern React with Vite
- 🎨 Beautiful UI with Tailwind CSS
- 🔐 Google OAuth Authentication
- 📊 User Dashboard
- 👤 Profile Management
- 🗄️ MongoDB Integration
- 📱 Responsive Design

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Google OAuth

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Cloud Console account for OAuth

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_URL=http://localhost:5000
```

Update the `.env` file for backend configuration:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ai-productivity-app
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:5173`
6. Add authorized redirect URIs: `http://localhost:5173`
7. Copy the Client ID to your environment variables

### 4. MongoDB Setup

**Option 1: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Database will be created automatically

**Option 2: MongoDB Atlas (Cloud)**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster
- Get connection string
- Update MONGODB_URI in .env file

### 5. Run the Application

**Development Mode (Frontend + Backend):**
```bash
npm run dev:full
```

**Or run separately:**

Frontend only:
```bash
npm run dev
```

Backend only:
```bash
npm run server
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
ai-productivity-app/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProfileSetup.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── user.js
│   └── server.js
├── package.json
└── README.md
```

## User Flow

1. **Landing Page**: Welcome page with features and "Get Started" button
2. **Login**: Google OAuth authentication
3. **Profile Setup**: New users complete their profile (mobile, bio, role)
4. **Dashboard**: Main application interface with user stats and activities

## User Roles

- **Organizer**: Can create and manage events, coordinate teams
- **Volunteer**: Can participate in events and collaborate with teams

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
