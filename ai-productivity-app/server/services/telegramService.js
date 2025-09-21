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
}

export default new TelegramService();
