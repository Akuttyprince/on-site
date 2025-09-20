import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Users, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Crown,
  Shield,
  AlertTriangle,
  Save,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import InviteMemberModal from './InviteMemberModal'

const ChannelSettings = ({ channel, onChannelUpdate }) => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editForm, setEditForm] = useState({
    name: channel.name,
    description: channel.description || '',
    eventType: channel.eventType,
    status: channel.status
  })
  const [loading, setLoading] = useState(false)

  const isAdmin = channel.admin._id === user._id

  const eventTypes = [
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'festival', label: 'Festival' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' }
  ]

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ]

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // This would be an actual API call to update channel
      const response = await axios.put(`/api/channels/${channel._id}`, editForm)
      onChannelUpdate(response.data.channel)
      setIsEditing(false)
      toast.success('Channel updated successfully!')
    } catch (error) {
      console.error('Update channel error:', error)
      toast.error('Failed to update channel')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin) {
      toast.error('Only admin can remove members')
      return
    }

    try {
      await axios.delete(`/api/channels/${channel._id}/members/${memberId}`)
      // Update local state
      const updatedChannel = {
        ...channel,
        members: channel.members.filter(member => member.user._id !== memberId)
      }
      onChannelUpdate(updatedChannel)
      toast.success('Member removed successfully')
    } catch (error) {
      console.error('Remove member error:', error)
      toast.error('Failed to remove member')
    }
  }

  const handleDeleteChannel = async () => {
    if (!isAdmin) {
      toast.error('Only admin can delete channel')
      return
    }

    try {
      await axios.delete(`/api/channels/${channel._id}`)
      toast.success('Channel deleted successfully')
      // Redirect to dashboard would happen here
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Delete channel error:', error)
      toast.error('Failed to delete channel')
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-yellow-100 text-yellow-800',
      organizer: 'bg-blue-100 text-blue-800',
      volunteer: 'bg-green-100 text-green-800'
    }
    return colors[role] || colors.volunteer
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Channel Settings</h2>
          <p className="text-gray-600">Manage your channel configuration and members</p>
        </div>
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <Crown size={20} className="text-yellow-500" />
            <span className="text-sm text-gray-600">Admin Access</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Channel Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings size={20} className="mr-2" />
                Channel Information
              </h3>
              {isAdmin && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition duration-200"
                >
                  {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              )}
            </div>

            {isEditing && isAdmin ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={editForm.eventType}
                      onChange={(e) => setEditForm({ ...editForm, eventType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel Name
                  </label>
                  <p className="text-gray-900">{channel.name}</p>
                </div>

                {channel.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900">{channel.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <p className="text-gray-900 capitalize">{channel.eventType}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      statusOptions.find(s => s.value === channel.status)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusOptions.find(s => s.value === channel.status)?.label || channel.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <p className="text-gray-900">{new Date(channel.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin
                    </label>
                    <div className="flex items-center space-x-2">
                      <img
                        src={channel.admin.profilePicture || '/default-avatar.png'}
                        alt={channel.admin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-gray-900">{channel.admin.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Members Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users size={20} className="mr-2" />
                Members ({channel.members?.length || 0})
              </h3>
              {isAdmin && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
                >
                  <UserPlus size={16} />
                  <span>Invite Member</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {channel.members?.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.user.profilePicture || '/default-avatar.png'}
                      alt={member.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{member.user.name}</span>
                        {member.role === 'admin' && <Crown size={16} className="text-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    
                    {isAdmin && member.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded transition duration-200"
                        title="Remove member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permissions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield size={20} className="mr-2" />
              Your Permissions
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">View channel</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Create tasks</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Invite members</span>
                <span className={isAdmin ? "text-green-600" : "text-red-600"}>
                  {isAdmin ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Edit channel</span>
                <span className={isAdmin ? "text-green-600" : "text-red-600"}>
                  {isAdmin ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Delete channel</span>
                <span className={isAdmin ? "text-green-600" : "text-red-600"}>
                  {isAdmin ? "✓" : "✗"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <AlertTriangle size={20} className="mr-2" />
                Danger Zone
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Delete Channel</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Once you delete a channel, there is no going back. This will permanently delete the channel, all tasks, and remove all members.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                  >
                    Delete Channel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          channel={channel}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {
            setShowInviteModal(false)
            // Refresh channel data if needed
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Channel</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{channel.name}"? This action cannot be undone and will permanently delete all tasks and data.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChannel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Delete Channel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ChannelSettings
