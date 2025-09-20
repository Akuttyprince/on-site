import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Award
} from 'lucide-react'
import axios from 'axios'

const ChannelAnalytics = ({ channel }) => {
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    teamProductivity: 0,
    averageCompletionTime: 0,
    tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    memberStats: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [channel._id])

  const fetchAnalytics = async () => {
    try {
      // This would be a real API call in production
      // For now, we'll simulate analytics data
      const mockAnalytics = {
        totalTasks: 24,
        completedTasks: 18,
        inProgressTasks: 4,
        overdueTasks: 2,
        teamProductivity: 85,
        averageCompletionTime: 2.5,
        tasksByPriority: { low: 6, medium: 12, high: 4, urgent: 2 },
        memberStats: channel.members?.map(member => ({
          user: member.user,
          tasksCompleted: Math.floor(Math.random() * 10) + 1,
          tasksInProgress: Math.floor(Math.random() * 3),
          productivity: Math.floor(Math.random() * 30) + 70
        })) || [],
        recentActivity: [
          { action: 'Task completed', user: 'John Doe', task: 'Design event poster', time: '2 hours ago' },
          { action: 'Task created', user: 'Jane Smith', task: 'Book venue', time: '4 hours ago' },
          { action: 'Task assigned', user: 'Mike Johnson', task: 'Coordinate catering', time: '6 hours ago' },
          { action: 'Task completed', user: 'Sarah Wilson', task: 'Send invitations', time: '1 day ago' }
        ]
      }
      
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const completionRate = analytics.totalTasks > 0 
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) 
    : 0

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your team's progress and productivity</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalTasks}</p>
              <p className="text-sm text-green-600 mt-1">+12% from last week</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.completedTasks}</p>
              <p className="text-sm text-green-600 mt-1">{completionRate}% completion rate</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.inProgressTasks}</p>
              <p className="text-sm text-blue-600 mt-1">Active tasks</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Team Productivity</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.teamProductivity}%</p>
              <p className="text-sm text-green-600 mt-1">Above average</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Task Priority</h3>
            <PieChart size={20} className="text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.tasksByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${priorityColors[priority]}`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{priority}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${priorityColors[priority]}`}
                      style={{ width: `${(count / analytics.totalTasks) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
            <Users size={20} className="text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {analytics.memberStats.slice(0, 5).map((member, index) => (
              <div key={member.user._id} className="flex items-center space-x-3">
                <img
                  src={member.user.profilePicture || '/default-avatar.png'}
                  alt={member.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{member.user.name}</span>
                    <span className="text-sm text-gray-600">{member.productivity}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{member.tasksCompleted} completed</span>
                    <span>•</span>
                    <span>{member.tasksInProgress} in progress</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${member.productivity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Clock size={20} className="text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.action.includes('completed') ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : activity.action.includes('created') ? (
                    <Target size={16} className="text-blue-600" />
                  ) : (
                    <Users size={16} className="text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">{activity.task}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg border"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
          <div className="flex items-center space-x-2">
            <Award size={20} className="text-yellow-500" />
            <span className="text-sm text-gray-600">Overall: {completionRate}% Complete</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-300"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{completionRate}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Tasks Completed</p>
            <p className="text-xs text-gray-500">{analytics.completedTasks} of {analytics.totalTasks}</p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-300"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${analytics.teamProductivity}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{analytics.teamProductivity}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Team Productivity</p>
            <p className="text-xs text-gray-500">Above average</p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{analytics.averageCompletionTime}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Avg. Completion</p>
            <p className="text-xs text-gray-500">Per task</p>
          </div>
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">AI Insights & Recommendations</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-blue-800">
                  <strong>🎯 Performance:</strong> Your team is performing 15% above average with an {analytics.teamProductivity}% productivity rate.
                </p>
                <p className="text-blue-800">
                  <strong>⚡ Speed:</strong> Tasks are being completed {analytics.averageCompletionTime} days faster than typical projects.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-purple-800">
                  <strong>📈 Suggestion:</strong> Consider increasing task complexity as your team shows high efficiency.
                </p>
                <p className="text-purple-800">
                  <strong>🔄 Optimization:</strong> Redistribute {analytics.overdueTasks} overdue tasks to maintain momentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChannelAnalytics
