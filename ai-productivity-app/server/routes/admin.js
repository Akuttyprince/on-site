import express from 'express';
import User from '../models/User.js';
import Channel from '../models/Channel.js';
import Task from '../models/Task.js';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';
import { requireAdmin, requirePermission } from '../middleware/admin.js';

const router = express.Router();

// Get admin dashboard statistics
router.get('/dashboard', auth.verifyToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalChannels,
      totalTasks,
      activeChannels,
      completedTasks,
      pendingTasks
    ] = await Promise.all([
      User.countDocuments(),
      Channel.countDocuments(),
      Task.countDocuments(),
      Channel.countDocuments({ status: 'active' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: { $in: ['todo', 'in-progress'] } })
    ]);

    // Get recent activity
    const recentChannels = await Channel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('admin', 'name email')
      .select('name eventType status createdAt admin');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      statistics: {
        totalUsers,
        totalChannels,
        totalTasks,
        activeChannels,
        completedTasks,
        pendingTasks
      },
      recentActivity: {
        channels: recentChannels,
        users: recentUsers
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination and filters
router.get('/users', auth.verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-googleId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role and permissions
router.put('/users/:userId/role', auth.verifyToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    if (!['admin', 'organizer', 'volunteer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updateData = { role };
    
    // Set permissions based on role
    if (role === 'admin') {
      updateData.permissions = {
        canCreateChannels: true,
        canManageUsers: true,
        canAccessAnalytics: true,
        canExportData: true
      };
    } else if (role === 'organizer') {
      updateData.permissions = {
        canCreateChannels: true,
        canManageUsers: false,
        canAccessAnalytics: true,
        canExportData: true
      };
    } else {
      updateData.permissions = {
        canCreateChannels: true,
        canManageUsers: false,
        canAccessAnalytics: false,
        canExportData: false
      };
    }

    // Allow custom permissions if provided
    if (permissions) {
      updateData.permissions = { ...updateData.permissions, ...permissions };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-googleId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all channels with admin view
router.get('/channels', auth.verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const eventType = req.query.eventType || '';

    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (eventType) {
      query.eventType = eventType;
    }

    const channels = await Channel.find(query)
      .populate('admin', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Channel.countDocuments(query);

    // Get task counts for each channel
    const channelsWithStats = await Promise.all(
      channels.map(async (channel) => {
        const taskCount = await Task.countDocuments({ channel: channel._id });
        const completedTasks = await Task.countDocuments({ 
          channel: channel._id, 
          status: 'completed' 
        });
        
        return {
          ...channel.toObject(),
          stats: {
            totalTasks: taskCount,
            completedTasks,
            progress: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
          }
        };
      })
    );

    res.json({
      channels: channelsWithStats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete channel (admin only)
router.delete('/channels/:channelId', auth.verifyToken, requireAdmin, async (req, res) => {
  try {
    const { channelId } = req.params;

    // Delete associated tasks and messages
    await Promise.all([
      Task.deleteMany({ channel: channelId }),
      Message.deleteMany({ channel: channelId })
    ]);

    // Delete channel
    const channel = await Channel.findByIdAndDelete(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system analytics
router.get('/analytics', auth.verifyToken, requirePermission('canAccessAnalytics'), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
    }

    // User growth
    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Channel activity
    const channelActivity = await Channel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 }
        }
      }
    ]);

    // Task completion rates
    const taskStats = await Task.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Most active users
    const activeUsers = await Task.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$assignedTo",
          taskCount: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          taskCount: 1,
          completedTasks: 1,
          completionRate: {
            $cond: [
              { $gt: ["$taskCount", 0] },
              { $multiply: [{ $divide: ["$completedTasks", "$taskCount"] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { taskCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      userGrowth,
      channelActivity,
      taskStats,
      activeUsers,
      timeframe
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export data
router.get('/export/:type', auth.verifyToken, requirePermission('canExportData'), async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;

    let data = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = await User.find().select('-googleId -__v');
        filename = `users_export_${Date.now()}`;
        break;
      case 'channels':
        data = await Channel.find()
          .populate('admin', 'name email')
          .populate('members.user', 'name email');
        filename = `channels_export_${Date.now()}`;
        break;
      case 'tasks':
        data = await Task.find()
          .populate('assignedTo', 'name email')
          .populate('channel', 'name eventType');
        filename = `tasks_export_${Date.now()}`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(data);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

export default router;
