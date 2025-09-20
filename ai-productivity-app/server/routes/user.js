import express from 'express';
import User from '../models/User.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-googleId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { mobileNo, bio, role } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (mobileNo !== undefined) user.mobileNo = mobileNo;
    if (bio !== undefined) user.bio = bio;
    if (role !== undefined) user.role = role;

    // Mark profile as complete if all required fields are filled
    if (user.mobileNo && user.bio && user.role) {
      user.isProfileComplete = true;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        mobileNo: user.mobileNo,
        bio: user.bio,
        role: user.role,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
