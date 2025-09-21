import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TaskCompletionAlert = ({ alerts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              duration: 0.4 
            }}
            className="bg-white border-l-4 border-green-500 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Task Completed! 🎉
                  </h4>
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-sm text-gray-700 font-medium mb-2">
                  {alert.task.title}
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <User size={12} className="mr-1" />
                    <span>{alert.user.name}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={12} className="mr-1" />
                    <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                  </div>
                  
                  {alert.task.channel && (
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span>{alert.task.channel.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Completed
                    </span>
                    
                    {alert.task.priority && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        alert.task.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : alert.task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.task.priority} priority
                      </span>
                    )}
                  </div>
                </div>
                
                {alert.telegramSent && (
                  <div className="mt-2 flex items-center text-xs text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Sent to Telegram</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TaskCompletionAlert
