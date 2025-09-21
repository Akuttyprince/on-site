import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  // Profile completion fields
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  mobileNo: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'organizer', 'volunteer'],
    default: 'volunteer'
  },
  permissions: {
    canCreateChannels: {
      type: Boolean,
      default: true
    },
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canAccessAnalytics: {
      type: Boolean,
      default: false
    },
    canExportData: {
      type: Boolean,
      default: false
    }
  },
  telegramId: {
    type: String,
    default: ''
  },
  telegramUsername: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'flexible'],
    default: 'flexible'
  },
  preferences: {
    eventTypes: [{
      type: String,
      enum: ['hackathon', 'wedding', 'conference', 'workshop', 'meeting', 'festival', 'other']
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      telegram: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
