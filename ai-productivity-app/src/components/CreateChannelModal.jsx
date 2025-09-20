import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Users, Calendar, Briefcase, GraduationCap, Heart, Music } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CreateChannelModal = ({ onClose, onChannelCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: 'other'
  })
  const [loading, setLoading] = useState(false)

  const eventTypes = [
    { value: 'hackathon', label: 'Hackathon', icon: Briefcase, color: 'bg-blue-500' },
    { value: 'conference', label: 'Conference', icon: Users, color: 'bg-purple-500' },
    { value: 'workshop', label: 'Workshop', icon: GraduationCap, color: 'bg-green-500' },
    { value: 'wedding', label: 'Wedding', icon: Heart, color: 'bg-pink-500' },
    { value: 'festival', label: 'Festival', icon: Music, color: 'bg-orange-500' },
    { value: 'meeting', label: 'Meeting', icon: Calendar, color: 'bg-gray-500' },
    { value: 'other', label: 'Other', icon: Calendar, color: 'bg-indigo-500' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Channel name is required')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/channels/create', formData)
      onChannelCreated(response.data.channel)
      toast.success('Channel created successfully!')
    } catch (error) {
      console.error('Create channel error:', error)
      toast.error(error.response?.data?.message || 'Failed to create channel')
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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Channel</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Channel Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Tech Conference 2024"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your event..."
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Event Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {eventTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <label
                      key={type.value}
                      className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition duration-200 ${
                        formData.eventType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="eventType"
                        value={type.value}
                        checked={formData.eventType === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center mr-3`}>
                        <IconComponent size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Create Channel'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateChannelModal
