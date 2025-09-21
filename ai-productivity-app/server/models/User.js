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
    enum: ['organizer', 'volunteer'],
    default: 'volunteer'
  },
  telegramId: {
    type: String,
    default: ''
  },
  telegramUsername: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
