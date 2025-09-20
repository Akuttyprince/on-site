import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  MessageCircle, 
  Send,
  Edit3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format } from 'date-fns'

const TaskDetailModal = ({ task, channel, onClose, onTaskUpdate }) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleAddComment = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const response = await axios.post(`/api/tasks/${task._id}/comment`, {
        message: newComment
      })
      
      // Update task with new comment
      const updatedTask = {
        ...task,
        comments: [...(task.comments || []), response.data.comment]
      }
      
      onTaskUpdate(updatedTask)
      setNewComment('')
      toast.success('Comment added!')
    } catch (error) {
      console.error('Add comment error:', error)
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.patch(`/api/tasks/${task._id}/status`, { status: newStatus })
      onTaskUpdate(response.data.task)
      toast.success('Task status updated!')
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Failed to update status')
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || colors.medium
  }

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      done: 'bg-green-100 text-green-800'
    }
    return colors[status] || colors.todo
  }

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle size={20} className="mr-2" />
                  Comments ({task.comments?.length || 0})
                </h3>
                
                <div className="space-y-4 mb-4">
                  {task.comments?.map((comment, index) => (
                    <div key={index} className="flex space-x-3">
                      <img
                        src={comment.user?.profilePicture || '/default-avatar.png'}
                        alt={comment.user?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {comment.user?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!task.comments || task.comments.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No comments yet</p>
                    </div>
                  )}
                </div>

                {/* Add Comment */}
                <form onSubmit={handleAddComment} className="flex space-x-3">
                  <img
                    src={user?.profilePicture || '/default-avatar.png'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition duration-200"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Update */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 ${
                        task.status === option.value
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Task Details</h4>
                <div className="space-y-4">
                  {/* Assigned To */}
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Assigned to</p>
                      {task.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={task.assignedTo.profilePicture || '/default-avatar.png'}
                            alt={task.assignedTo.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Due date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Estimated Hours */}
                  {task.estimatedHours > 0 && (
                    <div className="flex items-center space-x-3">
                      <Clock size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated time</p>
                        <p className="text-sm font-medium text-gray-900">
                          {task.estimatedHours} hours
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <Tag size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Created By */}
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Created by</p>
                      <div className="flex items-center space-x-2">
                        <img
                          src={task.createdBy?.profilePicture || '/default-avatar.png'}
                          alt={task.createdBy?.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {task.createdBy?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>• Consider breaking this task into smaller subtasks</p>
                      <p>• Add a checklist for better tracking</p>
                      <p>• Set up regular check-ins with the assignee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TaskDetailModal
