import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    enum: ['hackathon', 'wedding', 'conference', 'workshop', 'meeting', 'festival', 'other'],
    default: 'other'
  },
  aiContext: {
    objective: String,
    targetAudience: String,
    budget: String,
    timeline: String,
    challenges: String
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'organizer', 'volunteer'],
      default: 'volunteer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  invitations: [{
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['organizer', 'volunteer'],
      default: 'volunteer'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiPlan: {
    eventDetails: {
      type: Object,
      default: {}
    },
    actionPlan: {
      type: Array,
      default: []
    },
    generatedAt: {
      type: Date
    }
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  }
}, {
  timestamps: true
});

export default mongoose.model('Channel', channelSchema);
