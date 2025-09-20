import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Settings, 
  MessageCircle, 
  Plus, 
  Crown,
  Briefcase,
  GraduationCap,
  Heart,
  Music
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import InviteMemberModal from './InviteMemberModal'

const ChannelCard = ({ channel }) => {
  const navigate = useNavigate()
  const [showInviteModal, setShowInviteModal] = useState(false)

  const getEventIcon = (eventType) => {
    const icons = {
      hackathon: Briefcase,
      conference: Users,
      workshop: GraduationCap,
      wedding: Heart,
      festival: Music,
      meeting: Calendar,
      other: Calendar
    }
    return icons[eventType] || Calendar
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || colors.planning
  }

  const isAdmin = channel.admin._id === channel.members?.find(m => m.role === 'admin')?.user._id

  const EventIcon = getEventIcon(channel.eventType)

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition duration-300 cursor-pointer"
        onClick={() => navigate(`/channel/${channel._id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <EventIcon size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{channel.eventType}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(channel.status)}`}>
              {channel.status}
            </span>
            {isAdmin && (
              <Crown size={16} className="text-yellow-500" title="You are admin" />
            )}
          </div>
        </div>

        {channel.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{channel.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500">
              <Users size={16} />
              <span className="text-sm">{channel.members?.length || 0} members</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Calendar size={16} />
              <span className="text-sm">
                {formatDistanceToNow(new Date(channel.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowInviteModal(true)
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                title="Invite members"
              >
                <Plus size={16} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/channel/${channel._id}/chat`)
              }}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition duration-200"
              title="Open chat"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>

        {/* Member Avatars */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex -space-x-2">
            {channel.members?.slice(0, 4).map((member, index) => (
              <img
                key={member.user._id}
                src={member.user.profilePicture || '/default-avatar.png'}
                alt={member.user.name}
                className="w-8 h-8 rounded-full border-2 border-white"
                title={member.user.name}
              />
            ))}
            {channel.members?.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{channel.members.length - 4}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Admin: {channel.admin.name}
          </div>
        </div>
      </motion.div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          channel={channel}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {
            setShowInviteModal(false)
            // Could refresh channel data here if needed
          }}
        />
      )}
    </>
  )
}

export default ChannelCard
