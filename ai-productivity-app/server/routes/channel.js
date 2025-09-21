import express from 'express';
import Channel from '../models/Channel.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';
import telegramService from '../services/telegramService.js';

const router = express.Router();

// Create a new channel
router.post('/create', auth.verifyToken, async (req, res) => {
  try {
    const { name, description, eventType } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    const channel = new Channel({
      name,
      description,
      eventType,
      admin: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });

    await channel.save();
    await channel.populate('admin', 'name email profilePicture');
    await channel.populate('members.user', 'name email profilePicture');

    res.status(201).json({
      message: 'Channel created successfully',
      channel
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's channels
router.get('/my-channels', auth.verifyToken, async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [
        { admin: req.userId },
        { 'members.user': req.userId }
      ]
    })
    .populate('admin', 'name email profilePicture')
    .populate('members.user', 'name email profilePicture')
    .sort({ updatedAt: -1 });

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get channel details
router.get('/:channelId', auth.verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate('admin', 'name email profilePicture')
      .populate('members.user', 'name email profilePicture')
      .populate('invitations.invitedBy', 'name email');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is a member or admin
    const isMember = channel.members.some(member => 
      member.user._id.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ channel });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite member to channel
router.post('/:channelId/invite', auth.verifyToken, async (req, res) => {
  try {
    const { email, role = 'volunteer' } = req.body;
    const channelId = req.params.channelId;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is admin
    if (channel.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can invite members' });
    }

    // Check if user exists
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ 
        message: 'User with this email not found. They need to sign up first.' 
      });
    }

    // Check if already a member
    const isAlreadyMember = channel.members.some(member => 
      member.user.toString() === invitedUser._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Check if already invited
    const existingInvitation = channel.invitations.find(inv => 
      inv.email === email && inv.status === 'pending'
    );

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent' });
    }

    // Add invitation
    channel.invitations.push({
      email,
      role,
      invitedBy: req.userId
    });

    await channel.save();

    res.json({ 
      message: 'Invitation sent successfully',
      invitation: {
        email,
        role,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept invitation
router.post('/invitation/:channelId/accept', auth.verifyToken, async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const user = await User.findById(req.userId);

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Find the invitation
    const invitation = channel.invitations.find(inv => 
      inv.email === user.email && inv.status === 'pending'
    );

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or already processed' });
    }

    // Add user to members
    channel.members.push({
      user: req.userId,
      role: invitation.role
    });

    // Update invitation status
    invitation.status = 'accepted';

    await channel.save();
    await channel.populate('admin', 'name email profilePicture');
    await channel.populate('members.user', 'name email profilePicture');

    res.json({ 
      message: 'Invitation accepted successfully',
      channel
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's pending invitations
router.get('/invitations/pending', auth.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    const channels = await Channel.find({
      'invitations.email': user.email,
      'invitations.status': 'pending'
    })
    .populate('admin', 'name email profilePicture')
    .populate('invitations.invitedBy', 'name email');

    const invitations = channels.map(channel => {
      const invitation = channel.invitations.find(inv => 
        inv.email === user.email && inv.status === 'pending'
      );
      
      return {
        channelId: channel._id,
        channelName: channel.name,
        channelDescription: channel.description,
        eventType: channel.eventType,
        admin: channel.admin,
        role: invitation.role,
        invitedAt: invitation.invitedAt,
        invitedBy: invitation.invitedBy
      };
    });

    res.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get channel messages
router.get('/:channelId/messages', auth.verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    
    // Check if user is a member of the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isMember = channel.members.some(member => 
      member.user.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ channel: channelId })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to channel
router.post('/:channelId/messages', auth.verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if user is a member of the channel
    const channel = await Channel.findById(channelId).populate('members.user', 'telegramId telegramUsername name');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isMember = channel.members.some(member => 
      member.user._id.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = new Message({
      content,
      type,
      sender: req.userId,
      channel: channelId
    });

    await message.save();
    await message.populate('sender', 'name email profilePicture');

    // Send Telegram notifications to all members
    const telegramIds = channel.members
      .map(member => member.user.telegramId)
      .filter(id => id && id !== '');

    if (telegramIds.length > 0) {
      const user = await User.findById(req.userId);
      await telegramService.sendChannelNotification(telegramIds, channel, {
        channel,
        user,
        message: content,
        timestamp: new Date()
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
