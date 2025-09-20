import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Bot, 
  MessageSquare, 
  CheckSquare,
  BarChart3,
  Calendar
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import ChannelChat from '../components/ChannelChat'
import KanbanBoard from '../components/KanbanBoard'
import ChannelAnalytics from '../components/ChannelAnalytics'
import ChannelSettings from '../components/ChannelSettings'

const ChannelPage = () => {
  const { channelId } = useParams()
  const navigate = useNavigate()
  const [channel, setChannel] = useState(null)
  const [activeTab, setActiveTab] = useState('chat')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChannelData()
  }, [channelId])

  const fetchChannelData = async () => {
    try {
      const response = await axios.get(`/api/channels/${channelId}`)
      setChannel(response.data.channel)
    } catch (error) {
      console.error('Failed to fetch channel:', error)
      if (error.response?.status === 404) {
        toast.error('Channel not found')
        navigate('/dashboard')
      } else if (error.response?.status === 403) {
        toast.error('Access denied')
        navigate('/dashboard')
      } else {
        toast.error('Failed to load channel')
      }
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'text-blue-600' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-green-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-purple-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Channel not found</h2>
            <p className="text-gray-600 mb-4">The channel you're looking for doesn't exist or you don't have access.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-200 rounded-full transition duration-200"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{channel.name}</h1>
                <p className="text-gray-600 capitalize">{channel.eventType} • {channel.status}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users size={20} />
                <span>{channel.members?.length || 0} members</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar size={20} />
                <span>Created {new Date(channel.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {channel.description && (
            <p className="text-gray-700 bg-white p-4 rounded-lg border">{channel.description}</p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition duration-200 ${
                      activeTab === tab.id
                        ? `border-blue-500 ${tab.color}`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'chat' && <ChannelChat channel={channel} />}
          {activeTab === 'tasks' && <KanbanBoard channel={channel} />}
          {activeTab === 'analytics' && <ChannelAnalytics channel={channel} />}
          {activeTab === 'settings' && <ChannelSettings channel={channel} onChannelUpdate={setChannel} />}
        </motion.div>
      </div>
    </div>
  )
}

export default ChannelPage
