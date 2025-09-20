import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, UserPlus, AlertCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const InviteMemberModal = ({ channel, onClose, onInviteSent }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'volunteer'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`/api/channels/${channel._id}/invite`, formData)
      toast.success('Invitation sent successfully!')
      onInviteSent()
    } catch (error) {
      console.error('Invite member error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to send invitation'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invite Member</h2>
                <p className="text-sm text-gray-600">to {channel.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  The person must already have an account with us. They'll receive an invitation notification in their dashboard.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter their email address"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="volunteer">Volunteer</option>
                <option value="organizer">Organizer</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'organizer' 
                  ? 'Can create tasks, manage members, and coordinate activities'
                  : 'Can participate in activities and complete assigned tasks'
                }
              </p>
            </div>

            {/* Current Members */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Members ({channel.members?.length || 0})</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {channel.members?.map((member) => (
                  <div key={member.user._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <img
                      src={member.user.profilePicture || '/default-avatar.png'}
                      alt={member.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'admin' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : member.role === 'organizer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default InviteMemberModal
