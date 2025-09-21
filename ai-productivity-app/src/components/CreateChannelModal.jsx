import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Calendar, Briefcase, GraduationCap, Heart, Music, ArrowRight, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CreateChannelModal = ({ onClose, onChannelCreated }) => {
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Questions
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: 'other'
  })
  const [questions, setQuestions] = useState({
    q1: '', // What is the main objective/goal of this event?
    q2: '', // Who is your target audience?
    q3: '', // What is your estimated budget range?
    q4: '', // What is your preferred timeline/deadline?
    q5: ''  // What are your biggest concerns or challenges?
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

  const questionsList = [
    {
      id: 'q1',
      question: 'What is the main objective or goal of this event?',
      placeholder: 'e.g., Bring together tech professionals to share knowledge and network...'
    },
    {
      id: 'q2',
      question: 'Who is your target audience?',
      placeholder: 'e.g., Software developers, students, industry professionals...'
    },
    {
      id: 'q3',
      question: 'What is your estimated budget range?',
      placeholder: 'e.g., $10,000 - $50,000 or Limited budget...'
    },
    {
      id: 'q4',
      question: 'What is your preferred timeline or deadline?',
      placeholder: 'e.g., 3 months from now, by December 2024...'
    },
    {
      id: 'q5',
      question: 'What are your biggest concerns or challenges?',
      placeholder: 'e.g., Finding the right venue, managing logistics, marketing...'
    }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleQuestionChange = (e) => {
    setQuestions({
      ...questions,
      [e.target.name]: e.target.value
    })
  }

  const handleNext = () => {
    if (!formData.name.trim()) {
      toast.error('Channel name is required')
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Channel name is required')
      return
    }

    setLoading(true)
    try {
      // Combine form data with questions
      const channelData = {
        ...formData,
        aiContext: {
          objective: questions.q1,
          targetAudience: questions.q2,
          budget: questions.q3,
          timeline: questions.q4,
          challenges: questions.q5
        }
      }

      const response = await axios.post('/api/channels/create', channelData)
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
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Channel</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {step} of 2: {step === 1 ? 'Basic Information' : 'Event Details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-4 h-4 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
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

                  {/* Navigation Buttons */}
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition duration-200 flex items-center justify-center"
                    >
                      <span>Next</span>
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tell us more about your event</h3>
                    <p className="text-sm text-gray-600">This information will help our AI provide better assistance and recommendations.</p>
                  </div>

                  {/* Questions */}
                  {questionsList.map((q, index) => (
                    <div key={q.id}>
                      <label htmlFor={q.id} className="block text-sm font-medium text-gray-700 mb-2">
                        {index + 1}. {q.question}
                      </label>
                      <textarea
                        id={q.id}
                        name={q.id}
                        value={questions[q.id]}
                        onChange={handleQuestionChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={q.placeholder}
                      />
                    </div>
                  ))}

                  {/* Navigation Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      <span>Back</span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateChannelModal
