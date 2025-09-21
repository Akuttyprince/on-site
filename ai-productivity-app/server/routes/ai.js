import express from 'express';
import Channel from '../models/Channel.js';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';
import { generateEventPlan, generateTaskSuggestions, generateRoleSuggestions } from '../services/aiService.js';

const router = express.Router();

// Generate AI event plan
router.post('/generate-plan', auth.verifyToken, async (req, res) => {
  try {
    const { channelId, eventDetails } = req.body;

    if (!channelId || !eventDetails) {
      return res.status(400).json({ message: 'Channel ID and event details are required' });
    }

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

    // Generate AI plan
    const aiPlan = await generateEventPlan(eventDetails);

    // Update channel with AI plan
    channel.aiPlan = {
      eventDetails,
      actionPlan: aiPlan,
      generatedAt: new Date()
    };

    await channel.save();

    // Create AI message in channel
    const aiMessage = new Message({
      channel: channelId,
      content: `🤖 **AI Event Plan Generated!**\n\n**Event:** ${aiPlan.eventName}\n**Type:** ${aiPlan.eventType}\n**Duration:** ${aiPlan.estimatedDuration}\n\n**Key Phases:**\n${aiPlan.phases.map(phase => `• ${phase.phase} (${phase.duration})`).join('\n')}\n\n**Recommended Roles:**\n${aiPlan.recommendedRoles.map(role => `• ${role.role}`).join('\n')}\n\n**AI Insights:**\n${aiPlan.aiInsights.map(insight => `💡 ${insight}`).join('\n')}`,
      type: 'ai-response',
      isAI: true,
      metadata: {
        aiContext: { type: 'event-plan', planId: aiPlan.generatedAt }
      }
    });

    await aiMessage.save();

    res.json({
      message: 'AI plan generated successfully',
      plan: aiPlan,
      messageId: aiMessage._id
    });
  } catch (error) {
    console.error('Generate AI plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ask AI a question
router.post('/ask', auth.verifyToken, async (req, res) => {
  try {
    const { channelId, question, context } = req.body;

    if (!channelId || !question) {
      return res.status(400).json({ message: 'Channel ID and question are required' });
    }

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

    // Generate AI response based on question type
    let aiResponse = '';
    
    if (question.toLowerCase().includes('task') || question.toLowerCase().includes('how to')) {
      aiResponse = `🤖 **AI Assistant Response:**\n\nBased on your question about "${question}", here are my suggestions:\n\n• Break down the task into smaller, manageable steps\n• Assign clear deadlines and responsibilities\n• Use the task board to track progress\n• Don't hesitate to ask team members for help\n• Consider if you need additional resources or tools\n\nWould you like me to create specific tasks for this or provide more detailed guidance?`;
    } else if (question.toLowerCase().includes('role') || question.toLowerCase().includes('assign')) {
      const roleSuggestions = await generateRoleSuggestions(channel.eventType, channel.members.length);
      aiResponse = `🤖 **Role Assignment Suggestions:**\n\n${roleSuggestions.map(role => `**${role.role}** (${role.priority})\n• Skills needed: ${role.skills.join(', ')}`).join('\n\n')}\n\nBased on your team size of ${channel.members.length} members, I recommend prioritizing the "essential" roles first.`;
    } else if (question.toLowerCase().includes('timeline') || question.toLowerCase().includes('schedule')) {
      aiResponse = `🤖 **Timeline Recommendations:**\n\nFor your ${channel.eventType} event, here's a suggested timeline:\n\n• **Planning Phase:** Start 6-8 weeks before\n• **Preparation Phase:** 2-3 weeks before\n• **Final Preparations:** 1 week before\n• **Event Day:** Execute according to plan\n• **Follow-up:** 1-2 weeks after\n\nWould you like me to create specific tasks with deadlines for each phase?`;
    } else {
      aiResponse = `🤖 **AI Assistant:**\n\nI understand you're asking about "${question}". Here are some general suggestions:\n\n• Check your current tasks and progress\n• Review the event plan we generated\n• Consider discussing with your team members\n• Break complex problems into smaller parts\n• Use the resources and tools available in your dashboard\n\nCould you provide more specific details so I can give you better guidance?`;
    }

    // Create AI message
    const aiMessage = new Message({
      channel: channelId,
      content: aiResponse,
      type: 'ai-response',
      isAI: true,
      metadata: {
        aiContext: { 
          type: 'question-answer', 
          originalQuestion: question,
          context 
        }
      }
    });

    await aiMessage.save();

    res.json({
      message: 'AI response generated',
      response: aiResponse,
      messageId: aiMessage._id
    });
  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task suggestions
router.post('/task-suggestions', auth.verifyToken, async (req, res) => {
  try {
    const { taskTitle, context } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const suggestions = await generateTaskSuggestions(taskTitle, context);

    res.json({
      suggestions
    });
  } catch (error) {
    console.error('Task suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Store AI-generated plan from Python backend
router.post('/store-plan', async (req, res) => {
  try {
    const planData = req.body;
    
    // Create AI message in the channel
    if (planData.channel_id) {
      const aiMessage = new Message({
        channel: planData.channel_id,
        content: `🤖 **AI Action Plan Generated!**\n\n**Request:** ${planData.user_request}\n**Event Type:** ${planData.event_type}\n\nI've created a comprehensive action plan with detailed cards and timeline. Check the AI assistant for the full plan!`,
        type: 'ai-response',
        isAI: true,
        metadata: {
          aiContext: { 
            type: 'action-plan', 
            planId: planData.plan_id,
            userRequest: planData.user_request
          }
        }
      });

      await aiMessage.save();
    }
    
    res.json({ success: true, message: 'Plan stored successfully' });
  } catch (error) {
    console.error('Store AI plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
