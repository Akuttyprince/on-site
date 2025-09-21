import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

class TelegramService {
  constructor() {
    // You'll need to create a bot with @BotFather on Telegram and get the token
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.bot = this.token ? new TelegramBot(this.token, { polling: false }) : null;
    
    if (this.token) {
      console.log('✅ Telegram Bot Token loaded successfully');
    } else {
      console.log('❌ Telegram Bot Token not found');
    }
  }

  async sendTaskUpdate(telegramId, taskData) {
    if (!this.bot || !telegramId) return;

    try {
      const message = this.formatTaskUpdateMessage(taskData);
      await this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
    }
  }

  async sendChannelNotification(telegramIds, channelData, messageData) {
    if (!this.bot || !telegramIds || telegramIds.length === 0) return;

    try {
      const message = this.formatChannelMessage(channelData, messageData);
      
      // Send to all members
      const promises = telegramIds.map(telegramId => 
        this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to send Telegram notifications:', error);
    }
  }

  formatTaskUpdateMessage(taskData) {
    const { task, user, oldStatus, newStatus, timestamp } = taskData;
    const statusEmoji = this.getStatusEmoji(newStatus);
    const time = new Date(timestamp).toLocaleString();

    return `🔔 *Task Update*

📋 *Task:* ${task.title}
👤 *Member:* ${user.name}
${statusEmoji} *Status:* ${oldStatus} → *${newStatus}*
📅 *Time:* ${time}

${task.description ? `📝 *Description:* ${task.description}` : ''}
${task.priority ? `⚡ *Priority:* ${task.priority}` : ''}`;
  }

  formatChannelMessage(channelData, messageData) {
    const { channel, user, message, timestamp } = messageData;
    const time = new Date(timestamp).toLocaleString();

    return `💬 *New Message in ${channel.name}*

👤 *From:* ${user.name}
📅 *Time:* ${time}

💭 *Message:*
${message}`;
  }

  getStatusEmoji(status) {
    const emojis = {
      'todo': '📝',
      'in-progress': '⏳',
      'review': '👀',
      'completed': '✅',
      'blocked': '🚫'
    };
    return emojis[status] || '📌';
  }

  async sendWelcomeMessage(telegramId, userName, channelName) {
    if (!this.bot || !telegramId) return;

    try {
      const message = `🎉 *Welcome to Event Management!*

Hi ${userName}! 👋

You've been successfully connected to the *${channelName}* event channel.

🔔 You'll receive notifications for:
• Task updates and assignments
• Important announcements
• Event milestones
• Team communications

Ready to collaborate! 🚀`;

      await this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  }

  async sendTaskCompletionNotification(telegramIds, taskData, channelData) {
    if (!this.bot || !telegramIds || telegramIds.length === 0) return;

    try {
      const { task, user, completedAt } = taskData;
      const { channel } = channelData;
      const time = new Date(completedAt).toLocaleString();

      const message = `🎉 *Task Completed!*

✅ *Task:* ${task.title}
👤 *Completed by:* ${user.name}
📋 *Channel:* ${channel.name}
📅 *Completed at:* ${time}

${task.description ? `📝 *Description:* ${task.description}` : ''}

Great job, team! 🚀`;

      // Send to all channel members
      const promises = telegramIds.map(telegramId => 
        this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to send task completion notifications:', error);
    }
  }

  async sendAIPlanNotification(telegramIds, planData, channelData) {
    if (!this.bot || !telegramIds || telegramIds.length === 0) return;

    try {
      const { eventType, generatedAt } = planData;
      const { channel } = channelData;
      const time = new Date(generatedAt).toLocaleString();

      const message = `🤖 *AI Event Plan Generated!*

📋 *Channel:* ${channel.name}
🎯 *Event Type:* ${eventType}
📅 *Generated at:* ${time}

🔍 *The AI has created a comprehensive event plan with:*
• Timeline and milestones
• Role assignments
• Budget breakdown
• Task recommendations
• Risk management

Check your dashboard to view the complete plan! 📊`;

      const promises = telegramIds.map(telegramId => 
        this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to send AI plan notifications:', error);
    }
  }

  async sendRoleAssignmentNotification(telegramId, roleData, channelData) {
    if (!this.bot || !telegramId) return;

    try {
      const { role, assignedBy, assignedAt } = roleData;
      const { channel } = channelData;
      const time = new Date(assignedAt).toLocaleString();

      const message = `👥 *Role Assignment Update*

🎯 *New Role:* ${role}
📋 *Channel:* ${channel.name}
👤 *Assigned by:* ${assignedBy.name}
📅 *Assigned at:* ${time}

You now have ${role} permissions in this channel. Check your dashboard for role-specific tasks! 💼`;

      await this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Failed to send role assignment notification:', error);
    }
  }

  async sendEventMilestoneNotification(telegramIds, milestoneData, channelData) {
    if (!this.bot || !telegramIds || telegramIds.length === 0) return;

    try {
      const { milestone, progress, achievedAt } = milestoneData;
      const { channel } = channelData;
      const time = new Date(achievedAt).toLocaleString();

      const message = `🎯 *Milestone Achieved!*

🏆 *Milestone:* ${milestone}
📋 *Channel:* ${channel.name}
📊 *Progress:* ${progress}%
📅 *Achieved at:* ${time}

Keep up the excellent work, team! 🌟`;

      const promises = telegramIds.map(telegramId => 
        this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to send milestone notifications:', error);
    }
  }

  async sendExportNotification(telegramId, exportData) {
    if (!this.bot || !telegramId) return;

    try {
      const { type, filename, downloadUrl, generatedAt } = exportData;
      const time = new Date(generatedAt).toLocaleString();

      const message = `📄 *Export Ready!*

📊 *Type:* ${type.toUpperCase()} Export
📁 *Filename:* ${filename}
📅 *Generated at:* ${time}

Your export is ready for download! 📥`;

      await this.bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Failed to send export notification:', error);
    }
  }
}

export default new TelegramService();
