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
    const { name, description, eventType, aiContext } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    const channel = new Channel({
      name,
      description,
      eventType,
      aiContext, // Store AI context for better assistance
      admin: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });

    await channel.save();
    await channel.populate('admin', 'name email profilePicture');
    await channel.populate('members.user', 'name email profilePicture');

    // If AI context is provided, send initial AI welcome message
    if (aiContext && (aiContext.objective || aiContext.targetAudience)) {
      try {
        const welcomeMessage = new Message({
          content: `🤖 **Welcome to ${name}!**\n\nI'm your AI assistant and I'm here to help you plan and execute this ${eventType}.\n\nBased on your inputs:\n${aiContext.objective ? `🎯 **Objective:** ${aiContext.objective}\n` : ''}${aiContext.targetAudience ? `👥 **Target Audience:** ${aiContext.targetAudience}\n` : ''}${aiContext.budget ? `💰 **Budget:** ${aiContext.budget}\n` : ''}${aiContext.timeline ? `⏰ **Timeline:** ${aiContext.timeline}\n` : ''}${aiContext.challenges ? `⚠️ **Key Challenges:** ${aiContext.challenges}\n` : ''}\nI'll provide personalized recommendations and help you create action plans. Feel free to ask me anything!`,
          type: 'ai-welcome',
          isAI: true,
          channel: channel._id,
          metadata: {
            aiContext: aiContext
          }
        });

        await welcomeMessage.save();
      } catch (msgError) {
        console.error('Failed to create welcome message:', msgError);
        // Don't fail channel creation if welcome message fails
      }
    }

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

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      req.app.get('io').to(channelId).emit('new-message', {
        message: message,
        channelId: channelId
      });
    }

    // Check if message should get AI response
    const shouldGetAIResponse = content.toLowerCase().includes('ai') || 
                                content.includes('?') || 
                                content.toLowerCase().includes('help') ||
                                content.toLowerCase().includes('suggest') ||
                                content.toLowerCase().includes('plan');

    if (shouldGetAIResponse) {
      try {
        // Call AI backend
        const axios = (await import('axios')).default;
        const aiResponse = await axios.post('http://localhost:5001/api/ai/chat', {
          message: content,
          channelId: channelId,
          userId: req.userId,
          eventType: channel.eventType,
          aiContext: channel.aiContext || {}
        });

        if (aiResponse.data.success) {
          // Create AI message
          const aiMessage = new Message({
            content: aiResponse.data.response,
            type: 'ai-response',
            isAI: true,
            channel: channelId
          });

          await aiMessage.save();

          // Emit AI response to channel
          if (req.app.get('io')) {
            req.app.get('io').to(channelId).emit('new-message', {
              message: aiMessage,
              channelId: channelId
            });
          }
        }
      } catch (aiError) {
        console.error('AI response error:', aiError);
        // Don't fail the message send if AI fails
      }
    }

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

// Delete channel
router.delete('/:channelId', auth.verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is admin
    if (channel.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can delete channel' });
    }

    // Delete all messages in the channel
    await Message.deleteMany({ channel: channelId });

    // Delete all tasks in the channel
    const Task = (await import('../models/Task.js')).default;
    await Task.deleteMany({ channel: channelId });

    // Delete the channel
    await Channel.findByIdAndDelete(channelId);

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update channel
router.put('/:channelId', auth.verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description, eventType, status } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is admin
    if (channel.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can update channel' });
    }

    // Update fields
    if (name) channel.name = name;
    if (description !== undefined) channel.description = description;
    if (eventType) channel.eventType = eventType;
    if (status) channel.status = status;

    await channel.save();
    await channel.populate('admin', 'name email profilePicture');
    await channel.populate('members.user', 'name email profilePicture');

    res.json({ 
      message: 'Channel updated successfully',
      channel 
    });
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from channel
router.delete('/:channelId/members/:memberId', auth.verifyToken, async (req, res) => {
  try {
    const { channelId, memberId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is admin
    if (channel.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    // Don't allow removing admin
    if (channel.admin.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove admin from channel' });
    }

    // Remove member
    channel.members = channel.members.filter(
      member => member.user.toString() !== memberId
    );

    await channel.save();
    await channel.populate('admin', 'name email profilePicture');
    await channel.populate('members.user', 'name email profilePicture');

    res.json({ 
      message: 'Member removed successfully',
      channel 
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
