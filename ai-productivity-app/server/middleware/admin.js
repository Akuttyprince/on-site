import User from '../models/User.js';

// Check if user has admin role
export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user has specific permission
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Admin has all permissions
      if (user.role === 'admin') {
        req.user = user;
        return next();
      }
      
      // Check specific permission
      if (!user.permissions || !user.permissions[permission]) {
        return res.status(403).json({ 
          message: `Permission required: ${permission}` 
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Check if user is channel admin or organizer
export const requireChannelAccess = (minRole = 'volunteer') => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      const channelId = req.params.channelId || req.body.channelId;
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Global admin has access to all channels
      if (user.role === 'admin') {
        req.user = user;
        return next();
      }
      
      // Check channel membership and role
      const Channel = (await import('../models/Channel.js')).default;
      const channel = await Channel.findById(channelId);
      
      if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
      }
      
      // Check if user is channel admin
      if (channel.admin.toString() === user._id.toString()) {
        req.user = user;
        req.channel = channel;
        return next();
      }
      
      // Check if user is a member with required role
      const membership = channel.members.find(
        member => member.user.toString() === user._id.toString()
      );
      
      if (!membership) {
        return res.status(403).json({ message: 'Not a channel member' });
      }
      
      const roleHierarchy = {
        'volunteer': 1,
        'organizer': 2,
        'admin': 3
      };
      
      const userRoleLevel = roleHierarchy[membership.role] || 1;
      const requiredRoleLevel = roleHierarchy[minRole] || 1;
      
      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ 
          message: `Minimum role required: ${minRole}` 
        });
      }
      
      req.user = user;
      req.channel = channel;
      req.membership = membership;
      next();
    } catch (error) {
      console.error('Channel access check error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};
