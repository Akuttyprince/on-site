# AI Productivity App - Event Management Platform

A comprehensive event management platform powered by AI, featuring separate Python AI backend and Node.js API server with React frontend.

## Features

### Core Features
- **User Authentication**: Google OAuth integration with role-based access
- **Event Channels**: Create and manage event-specific channels
- **Task Management**: Kanban-style task boards with real-time updates
- **Team Collaboration**: Real-time chat and messaging
- **AI Integration**: Advanced AI-powered event planning and suggestions
- **Analytics**: Track progress and team performance
- **Telegram Integration**: Comprehensive notification system

### AI-Powered Features
- **Event Plan Generation**: AI creates detailed event plans based on requirements
- **Role Suggestions**: AI recommends optimal team roles and responsibilities
- **Task Breakdown**: Intelligent task generation and assignment
- **PDF/Excel Export**: Export event plans and action items
- **Multi-language Support**: AI responses in multiple languages

### Admin Features
- **User Management**: Admin dashboard for user role management
- **System Analytics**: Comprehensive usage statistics and insights
- **Data Export**: Export system data in multiple formats
- **Channel Oversight**: Monitor and manage all channels

## Architecture

### Multi-Server Architecture
- **React Frontend** (Port 5173): User interface and client-side logic
- **Node.js API Server** (Port 5000): Main application logic, database, and real-time features
- **Python AI Backend** (Port 5001): AI processing, plan generation, and ML features

### Tech Stack

#### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.IO client for real-time updates
- Axios for API communication

#### Node.js Backend
- Express.js server
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT authentication
- Telegram Bot API integration

#### Python AI Backend
- Flask web framework
- LangChain with Groq LLM
- MongoDB integration
- PDF generation with ReportLab
- Excel export with OpenPyXL
- Multi-language support

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud)
- Google OAuth credentials
- Groq API key for AI features
- Telegram Bot Token (optional)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-productivity-app
npm install
```

### 2. Set Up Python AI Backend

```bash
# Navigate to AI backend directory
cd ai-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 3. Configure Environment Variables

#### Main `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/ai-productivity-app
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

#### AI Backend `.env` file (`ai-backend/.env`):
```env
GROQ_API_KEY=your-groq-api-key
MONGODB_URI=mongodb://localhost:27017/ai-productivity-app
NODE_SERVER_URL=http://localhost:5000
FLASK_PORT=5001
FLASK_DEBUG=True
```

### 4. Start All Servers

#### Option 1: Use the batch script (Windows)
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
