import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import telegramService from '../services/telegramService.js';

const router = express.Router();

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        profilePicture: picture || ''
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isProfileComplete: user.isProfileComplete,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth.verifyToken, async (req, res) => {
  try {
    const { name, mobileNo, bio, role, telegramId, telegramUsername } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (mobileNo !== undefined) user.mobileNo = mobileNo;
    if (bio !== undefined) user.bio = bio;
    if (role) user.role = role;
    if (telegramId !== undefined) user.telegramId = telegramId;
    if (telegramUsername !== undefined) user.telegramUsername = telegramUsername;
    
    // Mark profile as complete if required fields are filled
    if (name && mobileNo && bio && role) {
      user.isProfileComplete = true;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        mobileNo: user.mobileNo,
        bio: user.bio,
        role: user.role,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test Telegram connection
router.post('/test-telegram', auth.verifyToken, async (req, res) => {
  try {
    const { telegramId } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send test message
    await telegramService.sendWelcomeMessage(telegramId, user.name, 'Test Connection');
    
    res.json({ message: 'Test message sent successfully!' });
  } catch (error) {
    console.error('Telegram test error:', error);
    res.status(500).json({ message: 'Failed to send test message' });
  }
});

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default router;
