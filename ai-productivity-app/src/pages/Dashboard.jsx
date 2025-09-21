import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, Calendar, CheckCircle, Clock, Bell } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import CreateChannelModal from '../components/CreateChannelModal'
import ChannelCard from '../components/ChannelCard'
import InvitationsList from '../components/InvitationsList'

const Dashboard = () => {
  const { user } = useAuth()
  const [channels, setChannels] = useState([])
  const [invitations, setInvitations] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [channelsRes, invitationsRes, tasksRes] = await Promise.all([
        axios.get('/api/channels/my-channels').catch(() => ({ data: { channels: [] } })),
        axios.get('/api/channels/invitations/pending').catch(() => ({ data: { invitations: [] } })),
        axios.get('/api/tasks/my-tasks').catch(() => ({ data: { tasks: [] } }))
      ])

      setChannels(channelsRes.data.channels || [])
      setInvitations(invitationsRes.data.invitations || [])
      setMyTasks(tasksRes.data.tasks || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set default empty arrays if everything fails
      setChannels([])
      setInvitations([])
      setMyTasks([])
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleChannelCreated = (newChannel) => {
    setChannels(prev => [newChannel, ...prev])
    setShowCreateModal(false)
    toast.success('Channel created successfully!')
  }

  const handleInvitationAccepted = (channelId) => {
    setInvitations(prev => prev.filter(inv => inv.channelId !== channelId))
    fetchDashboardData() // Refresh to get updated channels
    toast.success('Invitation accepted!')
  }

  const stats = [
    { 
      name: 'Active Channels', 
      value: (channels?.length || 0).toString(), 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    { 
      name: 'My Tasks', 
      value: (myTasks?.length || 0).toString(), 
      icon: CheckCircle, 
      color: 'bg-green-500',
      change: '3 completed today'
    },
    { 
      name: 'Pending Invitations', 
      value: (invitations?.length || 0).toString(), 
      icon: Bell, 
      color: 'bg-orange-500',
      change: (invitations?.length || 0) > 0 ? 'Action required' : 'All caught up'
    },
    { 
      name: 'Events This Month', 
      value: (channels?.filter(c => c.status === 'active')?.length || 0).toString(), 
      icon: Calendar, 
      color: 'bg-purple-500',
      change: '2 upcoming'
    },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Manage your events, collaborate with teams, and let AI help you organize better.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                    <IconComponent size={24} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Invitations Alert */}
        {(invitations?.length || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <InvitationsList 
              invitations={invitations} 
              onAccept={handleInvitationAccepted}
            />
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Channels Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Channels</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-300"
                >
                  <Plus size={20} />
                  <span>Create Channel</span>
                </motion.button>
              </div>
              
              {(channels?.length || 0) === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No channels yet</h3>
                  <p className="text-gray-600 mb-4">Create your first channel to start organizing events with your team.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
                  >
                    Create Your First Channel
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {(channels || []).map((channel, index) => (
                    <motion.div
                      key={channel._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ChannelCard channel={channel} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile</h3>
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={user?.profilePicture || '/default-avatar.png'} 
                  alt={user?.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.role === 'organizer' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              {user?.bio && (
                <p className="text-sm text-gray-600 mb-4">{user.bio}</p>
              )}
              {user?.mobileNo && (
                <p className="text-sm text-gray-600">📱 {user.mobileNo}</p>
              )}
            </motion.div>

            {/* My Tasks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Tasks</h3>
              {(myTasks?.length || 0) === 0 ? (
                <p className="text-gray-600 text-sm">No tasks assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {(myTasks || []).slice(0, 3).map((task) => (
                    <div key={task._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.channel.name}</p>
                      </div>
                    </div>
                  ))}
                  {(myTasks?.length || 0) > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{(myTasks?.length || 0) - 3} more tasks
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onChannelCreated={handleChannelCreated}
        />
      )}
    </div>
  )
}

export default Dashboard
