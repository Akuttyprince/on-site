import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow, format } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const GlobalChat = ({ channel, isOpen, onClose }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState([])
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (isOpen && channel) {
      fetchMessages()
      
      // Initialize socket connection
      socketRef.current = io('http://localhost:5000')
      
      // Join channel room
      socketRef.current.emit('join-channel', channel._id)
      
      // Listen for new messages
      socketRef.current.on('new-message', (data) => {
        if (data.channelId === channel._id) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg._id === data.message._id)
            if (!exists) {
              return [...prev, data.message]
            }
            return prev
          })
        }
      })
      
      // Cleanup on unmount or channel change
      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leave-channel', channel._id)
          socketRef.current.disconnect()
        }
      }
    }
  }, [isOpen, channel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/channels/${channel._id}/messages`)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage,
      sender: user,
      type: 'text',
      status: 'sending',
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, tempMessage])
    const messageText = newMessage
    setNewMessage('')

    try {
      const response = await axios.post(`/api/channels/${channel._id}/messages`, {
        content: messageText,
        type: 'text'
      })

      // Update the temp message with the real one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id 
            ? { ...response.data.message, status: 'sent' }
            : msg
        )
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      // Update temp message to show error
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id 
            ? { ...msg, status: 'error' }
            : msg
        )
      )
      toast.error('Failed to send message')
    }
  }

  const getMessageStatus = (message) => {
    if (message.sender._id !== user._id) return null
    
    switch (message.status) {
      case 'sending':
        return <Clock size={12} className="text-gray-400" />
      case 'sent':
        return <Check size={12} className="text-gray-400" />
      case 'delivered':
        return <CheckCheck size={12} className="text-gray-400" />
      case 'read':
        return <CheckCheck size={12} className="text-blue-500" />
      case 'error':
        return <span className="text-red-500 text-xs">!</span>
      default:
        return <Check size={12} className="text-gray-400" />
    }
  }

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - messageDate) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm')
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return format(messageDate, 'dd/MM/yyyy')
    }
  }

  const renderMessage = (message, index) => {
    if (!message || !message.sender) return null
    
    const isOwn = message.sender._id === user._id
    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender?._id !== message.sender._id)
    const showTime = index === messages.length - 1 || 
                    messages[index + 1]?.sender?._id !== message.sender._id ||
                    new Date(messages[index + 1]?.createdAt) - new Date(message.createdAt) > 300000 // 5 minutes

    return (
      <motion.div
        key={message._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
      >
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
          {/* Avatar */}
          {showAvatar && !isOwn && (
            <img
              src={message.sender.profilePicture || '/default-avatar.png'}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          {!showAvatar && !isOwn && <div className="w-8" />}

          {/* Message Bubble */}
          <div className={`relative px-4 py-2 rounded-2xl ${
            isOwn 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          }`}>
            {/* Sender name for group messages */}
            {!isOwn && showAvatar && (
              <div className="text-xs font-medium text-blue-600 mb-1">
                {message.sender.name}
              </div>
            )}

            {/* Message content */}
            <div className="text-sm break-words">
              {message.content}
            </div>

            {/* Time and status */}
            {showTime && (
              <div className={`flex items-center justify-end space-x-1 mt-1 ${
                isOwn ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span className="text-xs">
                  {formatMessageTime(message.createdAt)}
                </span>
                {getMessageStatus(message)}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">
                {channel.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{channel.name}</h3>
              <p className="text-sm opacity-90">
                {channel.members?.length || 0} members
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition duration-200">
              <Phone size={20} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition duration-200">
              <Video size={20} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition duration-200">
              <MoreVertical size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {messages.map((message, index) => renderMessage(message, index))}
              </AnimatePresence>
              
              {/* Typing indicators */}
              {typing.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 transition duration-200"
            >
              <Paperclip size={20} />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <Smile size={18} />
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition duration-200"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}

export default GlobalChat
