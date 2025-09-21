import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Users, Calendar, BarChart3, MessageSquare, CheckSquare } from 'lucide-react'
import Navbar from '../components/Navbar'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            AI-Powered Event Management
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-blue-600"
            > & Team Collaboration</motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Revolutionize your event planning with intelligent AI assistance, real-time collaboration, 
            and seamless team management. Perfect for hackathons, conferences, workshops, and more.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition duration-300 shadow-lg"
              >
                Get Started
              </Link>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-4 px-8 rounded-lg text-lg transition duration-300"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Bot,
              title: "AI-Powered Planning",
              description: "Get intelligent event planning assistance with AI-generated action plans, role suggestions, and smart recommendations.",
              color: "blue"
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Real-time collaboration with WhatsApp-style messaging, task management, and instant notifications.",
              color: "green"
            },
            {
              icon: BarChart3,
              title: "Analytics & Insights",
              description: "Track team productivity, monitor progress, and get AI-powered insights to optimize your events.",
              color: "purple"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-16 grid md:grid-cols-2 gap-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-xl"
          >
            <div className="flex items-center mb-4">
              <MessageSquare className="w-8 h-8 mr-3" />
              <h3 className="text-2xl font-bold">Global Team Chat</h3>
            </div>
            <p className="text-blue-100 mb-4">
              WhatsApp-style messaging with real-time notifications, task completion alerts, and Telegram integration.
            </p>
            <ul className="space-y-2 text-blue-100">
              <li>• Real-time messaging</li>
              <li>• Task completion notifications</li>
              <li>• Telegram bot integration</li>
              <li>• File sharing & attachments</li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-8 rounded-xl"
          >
            <div className="flex items-center mb-4">
              <CheckSquare className="w-8 h-8 mr-3" />
              <h3 className="text-2xl font-bold">Smart Task Management</h3>
            </div>
            <p className="text-green-100 mb-4">
              Kanban boards with drag-and-drop, AI task suggestions, and automated progress tracking.
            </p>
            <ul className="space-y-2 text-green-100">
              <li>• Drag & drop Kanban boards</li>
              <li>• AI-powered task suggestions</li>
              <li>• Priority management</li>
              <li>• Progress analytics</li>
            </ul>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Event Management?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of event organizers who trust our AI-powered platform
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-lg text-lg transition duration-300 shadow-lg"
            >
              Start Your Free Trial
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default LandingPage
