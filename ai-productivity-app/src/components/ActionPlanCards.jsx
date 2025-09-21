import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDownload, 
  FaFilePdf, 
  FaFileExcel, 
  FaClock, 
  FaUsers, 
  FaRupeeSign,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ActionPlanCards = ({ actionPlan, planId, channelId }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800 border-blue-200',
      execution: 'bg-green-100 text-green-800 border-green-200',
      logistics: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      marketing: 'bg-purple-100 text-purple-800 border-purple-200',
      finance: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const exportPlan = async (format) => {
    if (!planId) {
      toast.error('Plan ID not available for export');
      return;
    }

    setIsExporting(true);
    try {
      const response = await axios.post(`http://localhost:5001/api/ai/export-plan/${format}`, {
        planId: planId
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
        
        toast.success(`${format.toUpperCase()} exported successfully!`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const createTasksFromPlan = async () => {
    if (!channelId || !actionPlan) {
      toast.error('Channel ID or action plan not available');
      return;
    }

    setIsExporting(true);
    try {
      const response = await axios.post('/api/tasks/create-from-ai', {
        channelId: channelId,
        actionPlan: actionPlan
      });

      if (response.data.tasks) {
        toast.success(`Created ${response.data.tasks.length} tasks from action plan!`);
      }
    } catch (error) {
      console.error('Create tasks error:', error);
      toast.error('Failed to create tasks from action plan');
    } finally {
      setIsExporting(false);
    }
  };

  if (!actionPlan) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No action plan available</p>
      </div>
    );
  }

  const { title, overview, cards = [], timeline, budget_summary, team_roles, success_metrics, risk_factors } = actionPlan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title || 'Action Plan'}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportPlan('pdf')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <FaFilePdf size={16} />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportPlan('excel')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FaFileExcel size={16} />
              <span>Excel</span>
            </button>
            <button
              onClick={createTasksFromPlan}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <FaCheckCircle size={16} />
              <span>Create Tasks</span>
            </button>
          </div>
        </div>
        
        {overview && (
          <p className="text-gray-600 leading-relaxed">{overview}</p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeline && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaClock className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Timeline</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{timeline.total_duration || 'TBD'}</p>
            <p className="text-sm text-gray-600">{timeline.phases?.length || 0} phases</p>
          </div>
        )}
        
        {budget_summary && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaRupeeSign className="text-green-600" size={20} />
              <h3 className="font-semibold text-gray-900">Budget</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{budget_summary.total_estimate || 'TBD'}</p>
            <p className="text-sm text-gray-600">{budget_summary.breakdown?.length || 0} categories</p>
          </div>
        )}
        
        {team_roles && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaUsers className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-900">Team Roles</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">{team_roles.length}</p>
            <p className="text-sm text-gray-600">roles defined</p>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Action Items</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(card.category)}`}>
                        {card.category?.toUpperCase() || 'GENERAL'}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(card.priority)}`}></div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h4>
                    <p className="text-gray-600 text-sm">{card.description}</p>
                  </div>
                  <button
                    onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    {expandedCard === index ? <FaCompress size={16} /> : <FaExpand size={16} />}
                  </button>
                </div>

                {/* Card Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {card.timeline && (
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400" size={14} />
                      <span className="text-sm text-gray-600">{card.timeline}</span>
                    </div>
                  )}
                  {card.budget_estimate && (
                    <div className="flex items-center space-x-2">
                      <FaRupeeSign className="text-gray-400" size={14} />
                      <span className="text-sm text-gray-600">{card.budget_estimate}</span>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {expandedCard === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-4 space-y-4"
                  >
                    {/* Tasks */}
                    {card.tasks && card.tasks.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Tasks:</h5>
                        <div className="space-y-2">
                          {card.tasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="flex items-start space-x-2">
                              <FaCheckCircle className="text-green-500 mt-1" size={14} />
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{task.task}</p>
                                {task.assignee && (
                                  <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {card.resources && card.resources.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Resources:</h5>
                        <div className="flex flex-wrap gap-2">
                          {card.resources.map((resource, resourceIndex) => (
                            <span
                              key={resourceIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dependencies */}
                    {card.dependencies && card.dependencies.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Dependencies:</h5>
                        <div className="space-y-1">
                          {card.dependencies.map((dependency, depIndex) => (
                            <div key={depIndex} className="flex items-center space-x-2">
                              <FaArrowRight className="text-gray-400" size={12} />
                              <span className="text-sm text-gray-600">{dependency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Sections */}
      {(success_metrics || risk_factors) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Success Metrics */}
          {success_metrics && success_metrics.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Success Metrics</span>
              </h3>
              <div className="space-y-2">
                {success_metrics.map((metric, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">{metric}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {risk_factors && risk_factors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FaExclamationTriangle className="text-yellow-600" />
                <span>Risk Factors</span>
              </h3>
              <div className="space-y-3">
                {risk_factors.map((risk, index) => (
                  <div key={index} className="border-l-4 border-yellow-400 pl-4">
                    <p className="font-medium text-gray-900">{risk.risk}</p>
                    <p className="text-sm text-gray-600">Impact: {risk.impact}</p>
                    <p className="text-sm text-gray-700 mt-1">{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionPlanCards;
