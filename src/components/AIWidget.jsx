import React, { useState } from 'react'
import { Copy, Check, X, FileText, Sparkles } from 'lucide-react'
import { generateMarkdownPlan } from '../services/ai'

const AIWidget = ({ aiResults, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('plan')

  const handleCopyPlan = async () => {
    try {
      const markdownPlan = generateMarkdownPlan(aiResults)
      await navigator.clipboard.writeText(markdownPlan)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy plan:', error)
    }
  }

  const { analysis, recommendedResources, developmentPlan } = aiResults

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card-bg/95 backdrop-blur-md border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">AI Development Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Tabs */}
          <div className="w-64 border-r border-gray-700 bg-gray-900/50">
            <div className="p-4">
              <button
                onClick={() => setActiveTab('plan')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'plan'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                Development Plan
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors mt-2 ${
                  activeTab === 'tools'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Sparkles size={16} className="inline mr-2" />
                Recommended Tools
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'plan' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Development Plan</h3>
                  <button
                    onClick={handleCopyPlan}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy Plan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Analysis */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-white mb-3">Project Analysis</h4>
                  <p className="text-gray-300 leading-relaxed">{analysis}</p>
                </div>

                {/* Development Approaches */}
                <div className="space-y-6">
                  <h4 className="text-md font-semibold text-white">Development Approaches</h4>
                  <p className="text-gray-300 mb-4">{developmentPlan.overview}</p>
                  
                  {developmentPlan.approaches.map((approach, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-medium">{approach.name}</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            approach.complexity === 'beginner' ? 'bg-green-500/20 text-green-400' :
                            approach.complexity === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {approach.complexity}
                          </span>
                          <span className="text-gray-400 text-sm">{approach.estimatedTime}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{approach.description}</p>
                      <div>
                        <span className="text-gray-400 text-sm">Required Tools:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {approach.tools.map((tool, toolIndex) => (
                            <span key={toolIndex} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recommended Tools</h3>
                <div className="space-y-4">
                  {recommendedResources.map((resource, index) => (
                    <div key={resource.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-white font-medium">{resource.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              resource.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              resource.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {resource.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{resource.description}</p>
                          <p className="text-gray-400 text-sm mb-3">
                            <strong>Why recommended:</strong> {resource.reason}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <a
                              href={resource.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Visit Website
                            </a>
                            {resource.docs && (
                              <a
                                href={resource.docs}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                Documentation
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIWidget 