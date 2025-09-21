import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, 
  FaPaperPlane, 
  FaMicrophone, 
  FaDownload, 
  FaFilePdf, 
  FaFileExcel,
  FaSpinner,
  FaTimes,
  FaExpand,
  FaCompress,
  FaMagic
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ActionPlanCards from './ActionPlanCards';

const AIAssistant = ({ channelId, channelData, isOpen, onToggle }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/ai/chat', {
        message: inputMessage,
        channelId,
        userId: user.id,
        eventType: channelData?.eventType || 'general',
        aiContext: channelData?.aiContext || {}
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateActionPlan = async () => {
    if (!inputMessage.trim() || isGeneratingPlan) return;

    const userRequest = inputMessage.trim();
    setInputMessage('');
    setIsGeneratingPlan(true);

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: userRequest,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:5001/api/ai/generate-action-plan', {
        request: userRequest,
        eventType: channelData?.eventType || 'general',
        channelId,
        userId: user.id,
        aiContext: channelData?.aiContext || {}
      });

      if (response.data.success) {
        const actionPlan = response.data.action_plan;
        setCurrentPlan({
          ...actionPlan,
          planId: response.data.plan_id
        });
        
        const planMessage = {
          id: Date.now() + 1,
          text: `I've generated a comprehensive action plan for your request!`,
          sender: 'ai',
          timestamp: new Date(),
          actionPlan: actionPlan,
          planId: response.data.plan_id
        };

        setMessages(prev => [...prev, planMessage]);
      }
    } catch (error) {
      console.error('Plan generation error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Failed to generate action plan. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const exportPlan = async (format) => {
    if (!currentPlan) return;

    try {
      const response = await axios.post(`http://localhost:5001/api/ai/export-plan/${format}`, {
        planId: currentPlan.planId || 'current'
      });

      if (response.data.success) {
        // Create download link
        const downloadUrl = `http://localhost:5001${response.data.downloadUrl}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = response.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50"
      >
        <FaRobot size={24} />
      </motion.button>
    );
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={`fixed ${isExpanded ? 'inset-4' : 'bottom-6 right-6 w-96 h-[500px]'} bg-white rounded-lg shadow-2xl z-50 flex flex-col`}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaRobot size={20} />
          <span className="font-semibold">AI Event Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-blue-700 p-1 rounded"
          >
            {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
          </button>
          <button
            onClick={onToggle}
            className="hover:bg-blue-700 p-1 rounded"
          >
            <FaTimes size={16} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateActionPlan}
            disabled={isGeneratingPlan || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50"
          >
            {isGeneratingPlan ? <FaSpinner className="animate-spin" size={12} /> : <FaMagic size={12} />}
            <span>Generate Plan</span>
          </button>
          
          {currentPlan && (
            <>
              <button
                onClick={() => exportPlan('pdf')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <FaFilePdf size={12} />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportPlan('excel')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <FaFileExcel size={12} />
                <span>Excel</span>
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Type your request above and click "Generate Plan" to create an action plan
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                
                {/* Action Plan Preview */}
                {message.actionPlan && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Action Plan Generated</h4>
                    {message.actionPlan.overview && (
                      <p className="text-xs text-gray-600 mb-2">{message.actionPlan.overview}</p>
                    )}
                    {message.actionPlan.cards && (
                      <div className="text-xs">
                        <strong>Action Items:</strong> {message.actionPlan.cards.length} cards
                      </div>
                    )}
                    {message.actionPlan.timeline && (
                      <div className="text-xs">
                        <strong>Duration:</strong> {message.actionPlan.timeline.total_duration || 'TBD'}
                      </div>
                    )}
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      View Full Plan
                    </button>
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
              <FaSpinner className="animate-spin" size={16} />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about event planning..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50"
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </div>
    </motion.div>

    {/* Expanded Action Plan Modal */}
    <AnimatePresence>
      {isExpanded && currentPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Action Plan Details</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <ActionPlanCards 
                actionPlan={currentPlan} 
                planId={currentPlan.planId}
                channelId={channelId}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default AIAssistant;
