import express from 'express';
import Task from '../models/Task.js';
import Channel from '../models/Channel.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import telegramService from '../services/telegramService.js';

const router = express.Router();

// Create a new task
router.post('/create', auth.verifyToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      channelId, 
      assignedTo, 
      priority, 
      dueDate, 
      estimatedHours,
      tags 
    } = req.body;

    if (!title || !channelId) {
      return res.status(400).json({ message: 'Title and channel are required' });
    }

    // Verify channel exists and user has access
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

    const task = new Task({
      title,
      description,
      channel: channelId,
      assignedTo,
      createdBy: req.userId,
      priority,
      dueDate,
      estimatedHours,
      tags: tags || []
    });

    await task.save();
    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email profilePicture');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for a channel
router.get('/channel/:channelId', auth.verifyToken, async (req, res) => {
  try {
    const channelId = req.params.channelId;

    // Verify channel access
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

    const tasks = await Task.find({ channel: channelId })
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email profilePicture')
      .sort({ createdAt: -1 });

    // Group tasks by status for Kanban board
    const tasksByStatus = {
      todo: tasks.filter(task => task.status === 'todo'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      review: tasks.filter(task => task.status === 'review'),
      done: tasks.filter(task => task.status === 'done')
    };

    res.json({ 
      tasks,
      tasksByStatus
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's tasks across all channels
router.get('/my-tasks', auth.verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.userId })
      .populate('channel', 'name eventType')
      .populate('createdBy', 'name email profilePicture')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
router.patch('/:taskId/status', auth.verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.taskId;

    if (!['todo', 'in-progress', 'review', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email profilePicture telegramId')
      .populate('createdBy', 'name email profilePicture');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Store old status for notification
    const oldStatus = task.status;

    // Check if user has permission to update
    const channel = await Channel.findById(task.channel).populate('members.user', 'telegramId name');
    const isMember = channel.members.some(member => 
      member.user._id.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    await task.save();

    // Get user who updated the task
    const updatedBy = await User.findById(req.userId);

    // Send Telegram notification to assigned user and channel members
    const telegramIds = [];
    
    // Add assigned user's telegram ID
    if (task.assignedTo?.telegramId) {
      telegramIds.push(task.assignedTo.telegramId);
    }
    
    // Add all channel members' telegram IDs
    channel.members.forEach(member => {
      if (member.user.telegramId && !telegramIds.includes(member.user.telegramId)) {
        telegramIds.push(member.user.telegramId);
      }
    });

    // Send Telegram notifications
    if (telegramIds.length > 0) {
      await telegramService.sendTaskUpdate(telegramIds[0], {
        task,
        user: updatedBy,
        oldStatus,
        newStatus: status,
        timestamp: new Date()
      });
    }

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to task
router.post('/:taskId/comment', auth.verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const taskId = req.params.taskId;

    if (!message) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission
    const channel = await Channel.findById(task.channel);
    const isMember = channel.members.some(member => 
      member.user.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments.push({
      user: req.userId,
      message
    });

    await task.save();
    await task.populate('comments.user', 'name email profilePicture');

    res.json({
      message: 'Comment added successfully',
      comment: task.comments[task.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
