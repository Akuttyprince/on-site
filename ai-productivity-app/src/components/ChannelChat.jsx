import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Lightbulb, 
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const ChannelChat = ({ channel }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message and AI introduction
    const welcomeMessages = [
      {
        _id: 'welcome-1',
        content: `🎉 Welcome to **${channel.name}**! This is your AI-powered event planning workspace.`,
        type: 'system',
        isAI: false,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'ai-intro',
        content: `🤖 Hi everyone! I'm your AI assistant, ready to help you plan the perfect ${channel.eventType}. Here's how I can help:

**🎯 Event Planning:**
• Generate comprehensive action plans
• Suggest timelines and milestones
• Recommend team roles and responsibilities

**📋 Task Management:**
• Break down complex tasks into manageable steps
• Provide task completion guidance
• Suggest optimal task assignments

**💡 Smart Suggestions:**
• Answer event planning questions
• Provide best practices and tips
• Help resolve planning challenges

**Ready to get started?** Try asking me:
• "Generate an action plan for our ${channel.eventType}"
• "What roles do we need for this event?"
• "How should we organize our timeline?"

Let's make this event amazing! 🚀`,
        type: 'ai-response',
        isAI: true,
        createdAt: new Date().toISOString()
      }
    ]
    setMessages(welcomeMessages)
  }, [channel])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    const userMessage = {
      _id: `user-${Date.now()}`,
      content: newMessage,
      sender: user,
      type: 'text',
      isAI: false,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = newMessage
    setNewMessage('')
    setAiLoading(true)

    try {
      // Call real AI backend with channel context
      const response = await axios.post('http://localhost:5001/api/ai/chat', {
        message: messageText,
        channelId: channel._id,
        userId: user._id,
        eventType: channel.eventType,
        aiContext: channel.aiContext || {
          objective: channel.description,
          targetAudience: 'General audience',
          budget: 'To be determined',
          timeline: 'Flexible',
          challenges: 'Planning and execution'
        }
      })

      if (response.data.success) {
        const aiResponse = {
          _id: `ai-${Date.now()}`,
          content: response.data.response,
          type: 'ai-response',
          isAI: true,
          createdAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, aiResponse])
      }
    } catch (error) {
      console.error('AI response error:', error)
      const errorMessage = {
        _id: `error-${Date.now()}`,
        content: "I'm sorry, I'm having trouble processing your request right now. Please make sure the AI backend is running on port 5001.",
        type: 'ai-response',
        isAI: true,
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    } finally {
      setAiLoading(false)
    }
  }

  const quickActions = [
    {
      label: 'Generate Action Plan',
      message: 'Generate a comprehensive action plan for our event',
      icon: Lightbulb,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg'
    },
    {
      label: 'Suggest Timeline',
      message: 'What timeline should we follow for this event?',
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
    },
    {
      label: 'Role Suggestions',
      message: 'What team roles do we need for this event?',
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-green-400 to-teal-500 text-white hover:from-green-500 hover:to-teal-600 shadow-lg'
    },
    {
      label: 'Budget Ideas',
      message: 'Help me plan the budget for this event',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-lg'
    },
    {
      label: 'Task Breakdown',
      message: 'Break down tasks for this event',
      icon: Clock,
      color: 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-lg'
    }
  ]

  const handleQuickAction = (message) => {
    setNewMessage(message)
  }

  const renderMessage = (message) => {
    const isUser = !message.isAI && message.sender
    const isSystem = message.type === 'system'
    const isAI = message.isAI

    if (isSystem) {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
            {message.content}
          </div>
        </div>
      )
    }

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-4xl`}>
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAI ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
          }`}>
            {isAI ? (
              <Bot size={20} className="text-white" />
            ) : (
              <img
                src={message.sender?.profilePicture || '/default-avatar.png'}
                alt={message.sender?.name}
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>

          {/* Message Content */}
          <div className={`${isUser ? 'mr-3' : 'ml-3'}`}>
            <div className={`rounded-2xl px-4 py-3 ${
              isUser 
                ? 'bg-blue-600 text-white' 
                : isAI 
                ? 'bg-white border border-gray-200 shadow-sm' 
                : 'bg-gray-100'
            }`}>
              {!isUser && !isAI && (
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {message.sender?.name}
                </div>
              )}
              
              <div className={`text-sm ${isUser ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap`}>
                {typeof message.content === 'string' ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/•/g, '•')
                      .replace(/\n/g, '<br>')
                  }} />
                ) : typeof message.content === 'object' && message.content !== null ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                      <h4 className="font-bold text-lg mb-3 text-blue-800">📋 Event Plan Generated</h4>
                      
                      {message.content.eventName && (
                        <div className="mb-3">
                          <span className="font-semibold text-gray-700">Event:</span> {message.content.eventName}
                        </div>
                      )}
                      
                      {message.content.eventType && (
                        <div className="mb-3">
                          <span className="font-semibold text-gray-700">Type:</span> {message.content.eventType}
                        </div>
                      )}
                      
                      {message.content.estimatedDuration && (
                        <div className="mb-3">
                          <span className="font-semibold text-gray-700">Duration:</span> {message.content.estimatedDuration}
                        </div>
                      )}
                      
                      {message.content.recommendedBudget && (
                        <div className="mb-3">
                          <span className="font-semibold text-gray-700">Budget:</span> {message.content.recommendedBudget}
                        </div>
                      )}
                      
                      {message.content.expectedAttendees && (
                        <div className="mb-3">
                          <span className="font-semibold text-gray-700">Expected Attendees:</span> {message.content.expectedAttendees}
                        </div>
                      )}
                      
                      {message.content.phases && Array.isArray(message.content.phases) && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2">📅 Event Phases:</h5>
                          <div className="space-y-2">
                            {message.content.phases.map((phase, index) => (
                              <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">{phase.name}</div>
                                <div className="text-sm text-gray-600">{phase.description}</div>
                                <div className="text-xs text-gray-500 mt-1">Duration: {phase.duration}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.content.recommendedRoles && Array.isArray(message.content.recommendedRoles) && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2">👥 Recommended Roles:</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {message.content.recommendedRoles.map((role, index) => (
                              <div key={index} className="bg-white p-2 rounded border text-center">
                                <div className="font-medium text-purple-800">{role.title}</div>
                                <div className="text-xs text-gray-600">{role.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.content.aiInsights && Array.isArray(message.content.aiInsights) && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2">💡 AI Insights:</h5>
                          <ul className="space-y-1">
                            {message.content.aiInsights.map((insight, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="text-yellow-500 mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Unable to display message content</div>
                )}
              </div>

              {/* AI Plan Actions */}
              {message.metadata?.type === 'event-plan' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition duration-200">
                      Create Tasks from Plan
                    </button>
                    <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition duration-200">
                      Export as PDF
                    </button>
                    <button className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition duration-200">
                      Share with Team
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Event Assistant</h3>
            <p className="text-sm text-gray-600">Get help planning your {channel.eventType}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderMessage(message)}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI Loading */}
        {aiLoading && (
          <div className="flex justify-start mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-100">
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.message)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition duration-200 ${action.color}`}
                >
                  <IconComponent size={16} />
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me anything about event planning..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={aiLoading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || aiLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-lg transition duration-200"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChannelChat
