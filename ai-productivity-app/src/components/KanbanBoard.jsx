import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import CreateTaskModal from './CreateTaskModal'
import TaskDetailModal from './TaskDetailModal'

const KanbanBoard = ({ channel }) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState({
    todo: [],
    'in-progress': [],
    review: [],
    done: []
  })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [channel._id])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/api/tasks/channel/${channel._id}`)
      setTasks(response.data.tasksByStatus)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask) => {
    setTasks(prev => ({
      ...prev,
      [newTask.status]: [...prev[newTask.status], newTask]
    }))
    setShowCreateModal(false)
    toast.success('Task created successfully!')
  }

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus })
      const updatedTask = response.data.task

      // Remove task from old status and add to new status
      setTasks(prev => {
        const newTasks = { ...prev }
        
        // Find and remove task from its current status
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].filter(task => task._id !== taskId)
        })
        
        // Add task to new status
        newTasks[newStatus] = [...newTasks[newStatus], updatedTask]
        
        return newTasks
      })

      toast.success('Task status updated!')
    } catch (error) {
      console.error('Failed to update task status:', error)
      toast.error('Failed to update task status')
    }
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      handleTaskStatusUpdate(draggedTask._id, newStatus)
    }
    setDraggedTask(null)
  }

  const columns = [
    { 
      id: 'todo', 
      title: 'To Do', 
      color: 'bg-gray-100 border-gray-300', 
      headerColor: 'bg-gray-50',
      count: tasks.todo.length 
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      color: 'bg-blue-100 border-blue-300', 
      headerColor: 'bg-blue-50',
      count: tasks['in-progress'].length 
    },
    { 
      id: 'review', 
      title: 'Review', 
      color: 'bg-yellow-100 border-yellow-300', 
      headerColor: 'bg-yellow-50',
      count: tasks.review.length 
    },
    { 
      id: 'done', 
      title: 'Done', 
      color: 'bg-green-100 border-green-300', 
      headerColor: 'bg-green-50',
      count: tasks.done.length 
    }
  ]

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || colors.medium
  }

  const TaskCard = ({ task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onClick={() => setSelectedTask(task)}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        {task.dueDate && (
          <div className="flex items-center space-x-1 text-gray-500">
            <Calendar size={12} />
            <span className="text-xs">
              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.assignedTo && (
            <img
              src={task.assignedTo.profilePicture || '/default-avatar.png'}
              alt={task.assignedTo.name}
              className="w-6 h-6 rounded-full"
              title={task.assignedTo.name}
            />
          )}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center space-x-1 text-gray-500">
              <MessageCircle size={12} />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
        </div>

        {task.estimatedHours && (
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock size={12} />
            <span className="text-xs">{task.estimatedHours}h</span>
          </div>
        )}
      </div>
    </motion.div>
  )

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
          <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
          <p className="text-gray-600">Manage and track your event tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
        >
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`${column.color} rounded-xl border-2 border-dashed min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`${column.headerColor} p-4 rounded-t-xl border-b`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                  {column.count}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {tasks[column.id].map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </AnimatePresence>

              {tasks[column.id].length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900">
                {Object.values(tasks).reduce((acc, taskList) => acc + taskList.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{tasks.done.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={16} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-xl font-bold text-gray-900">{tasks['in-progress'].length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-xl font-bold text-gray-900">
                {Object.values(tasks).reduce((acc, taskList) => 
                  acc + taskList.filter(task => task.priority === 'high' || task.priority === 'urgent').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          channel={channel}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          channel={channel}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={(updatedTask) => {
            // Update task in the current state
            setTasks(prev => {
              const newTasks = { ...prev }
              Object.keys(newTasks).forEach(status => {
                newTasks[status] = newTasks[status].map(task => 
                  task._id === updatedTask._id ? updatedTask : task
                )
              })
              return newTasks
            })
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

export default KanbanBoard
