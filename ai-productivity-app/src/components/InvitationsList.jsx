import { motion } from 'framer-motion'
import { Check, X, Clock, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

const InvitationsList = ({ invitations, onAccept }) => {
  const handleAcceptInvitation = async (channelId) => {
    try {
      await axios.post(`/api/channels/invitation/${channelId}/accept`)
      onAccept(channelId)
      toast.success('Invitation accepted!')
    } catch (error) {
      console.error('Accept invitation error:', error)
      toast.error(error.response?.data?.message || 'Failed to accept invitation')
    }
  }

  const handleDeclineInvitation = async (channelId) => {
    try {
      // You would implement decline endpoint in backend
      toast.success('Invitation declined')
    } catch (error) {
      console.error('Decline invitation error:', error)
      toast.error('Failed to decline invitation')
    }
  }

  if (!invitations || invitations.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Clock size={16} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Invitations ({invitations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <motion.div
            key={invitation.channelId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{invitation.channelName}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {invitation.eventType} • Role: {invitation.role}
                    </p>
                  </div>
                </div>
                
                {invitation.channelDescription && (
                  <p className="text-sm text-gray-600 mb-2">{invitation.channelDescription}</p>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>From: {invitation.invitedBy.name}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(invitation.invitedAt), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleAcceptInvitation(invitation.channelId)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition duration-200 flex items-center space-x-1"
                  title="Accept invitation"
                >
                  <Check size={16} />
                  <span className="hidden sm:inline">Accept</span>
                </button>
                <button
                  onClick={() => handleDeclineInvitation(invitation.channelId)}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition duration-200 flex items-center space-x-1"
                  title="Decline invitation"
                >
                  <X size={16} />
                  <span className="hidden sm:inline">Decline</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default InvitationsList
