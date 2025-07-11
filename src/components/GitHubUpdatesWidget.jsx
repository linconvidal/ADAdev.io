import React, { useState, useEffect } from 'react'
import { 
  GitCommit, 
  Tag, 
  Star, 
  GitFork, 
  Calendar,
  ExternalLink,
  AlertCircle,
  Github,
  ChevronRight
} from 'lucide-react'
import { fetchGitHubUpdates, formatRelativeTime, getCachedGitHubData } from '../services/github'
import { cardanoResources } from '../data/resources'

const GitHubUpdatesWidget = () => {
  const [githubData, setGithubData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('releases')
  const [collapseTimeout, setCollapseTimeout] = useState(null)

  // Handle click outside to collapse widget
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !event.target.closest('.github-widget')) {
        if (collapseTimeout) {
          clearTimeout(collapseTimeout)
          setCollapseTimeout(null)
        }
        setIsExpanded(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isExpanded, collapseTimeout])

  const loadGitHubData = async () => {
    try {
      const resourcesWithGitHub = Object.entries(cardanoResources).flatMap(([category, resources]) =>
        resources
          .filter(resource => resource.social?.github)
          .map(resource => ({ ...resource, category }))
      )

      const allData = []
      const resourcesToProcess = resourcesWithGitHub.slice(0, 3)
      
      console.log(`🔄 Widget: Loading fresh data for ${resourcesToProcess.length} resources`)
      
      for (let i = 0; i < resourcesToProcess.length; i++) {
        const resource = resourcesToProcess[i]
        
        try {
          console.log(`📡 Widget: Fetching data for ${resource.name}`)
          const data = await fetchGitHubUpdates(resource)
          
          if (data.releases.length > 0 || data.commits.length > 0) {
            allData.push({
              resource,
              ...data
            })
            console.log(`✅ Widget: Successfully loaded data for ${resource.name} - ${data.releases.length} releases, ${data.commits.length} commits`)
          } else {
            console.log(`⚠️ Widget: No recent activity for ${resource.name}`)
          }
          
          if (allData.length >= 2) break
        } catch (error) {
          console.warn(`❌ Widget: Failed to fetch data for ${resource.name}:`, error.message)
        }
      }
    
      if (allData.length === 0) {
        console.log(`📋 Widget: No data available, showing empty state`)
        setGithubData([])
      } else {
        const validData = allData.sort((a, b) => {
          const aLatest = Math.max(
            ...a.releases.map(r => new Date(r.publishedAt).getTime()),
            ...a.commits.map(c => new Date(c.date).getTime())
          )
          const bLatest = Math.max(
            ...b.releases.map(r => new Date(r.publishedAt).getTime()),
            ...b.commits.map(c => new Date(c.date).getTime())
          )
          return bLatest - aLatest
        })

        console.log(`📊 Widget: Final data loaded for ${validData.length} resources`)
        setGithubData(validData)
      }
    } catch (err) {
      console.error('Widget: GitHub data loading error:', err)
      setGithubData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check cached data for all resources with GitHub
    const checkCachedData = async () => {
      try {
        // Add a small delay to ensure resource cards have loaded first
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const resourcesWithGitHub = Object.entries(cardanoResources).flatMap(([category, resources]) =>
          resources
            .filter(resource => resource.social?.github)
            .map(resource => ({ ...resource, category }))
        )
        
        console.log(`🔍 Widget: Found ${resourcesWithGitHub.length} resources with GitHub URLs`)
        
        if (resourcesWithGitHub.length > 0) {
          const cachedDataArray = []
          for (const resource of resourcesWithGitHub) {
            console.log(`🔍 Widget: Checking cache for ${resource.name} (${resource.social.github})`)
            
            const cachedData = getCachedGitHubData(resource)
            if (cachedData && (cachedData.releases.length > 0 || cachedData.commits.length > 0)) {
              console.log(`✅ Widget: Found cached data for ${resource.name} - ${cachedData.releases.length} releases, ${cachedData.commits.length} commits`)
              cachedDataArray.push({ resource, ...cachedData })
            } else {
              console.log(`❌ Widget: No cached data for ${resource.name}`)
            }
          }
          
          console.log(`📊 Widget: Total cached resources found: ${cachedDataArray.length}`)
          
          if (cachedDataArray.length > 0) {
            setGithubData(cachedDataArray)
            setIsLoading(false)
            console.log(`📋 Widget: Using cached data for ${cachedDataArray.length} resources`)
            return
          } else {
            console.log(`🔄 Widget: No cached data found, loading fresh data...`)
            // Wait a bit for any ongoing cache population to complete
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Check cache again after waiting
            const retryCachedDataArray = []
            for (const resource of resourcesWithGitHub.slice(0, 3)) {
              const retryCachedData = getCachedGitHubData(resource)
              if (retryCachedData && (retryCachedData.releases.length > 0 || retryCachedData.commits.length > 0)) {
                retryCachedDataArray.push({ resource, ...retryCachedData })
              }
            }
            
            if (retryCachedDataArray.length > 0) {
              console.log(`📋 Widget: Found cached data after retry for ${retryCachedDataArray.length} resources`)
              setGithubData(retryCachedDataArray)
              setIsLoading(false)
              return
            }
          }
        }
      } catch (error) {
        console.log('Widget: Error checking cached data:', error)
      }
      
      // If no cached data found, load fresh data
      console.log(`🔄 Widget: Loading fresh data as fallback`)
      loadGitHubData()
    }
    checkCachedData()
  }, [])

  // Get total update count
  const totalUpdates = githubData.reduce((total, data) => {
    return total + data.releases.length + data.commits.length
  }, 0)

  // Aggregate all updates from all resources, sort by date, and limit to 50
  const allUpdates = githubData.flatMap(data => {
    const updates = []
    
    if (activeTab === 'releases') {
      data.releases.forEach(release => {
        updates.push({
          type: 'release',
          resource: data.resource,
          data: release,
          timestamp: new Date(release.publishedAt).getTime()
        })
      })
    } else {
      data.commits.forEach(commit => {
        updates.push({
          type: 'commit',
          resource: data.resource,
          data: commit,
          timestamp: new Date(commit.date).getTime()
        })
      })
    }
    
    return updates
  }).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)

  return (
    <div 
      className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block github-widget"
      onMouseEnter={() => {
        if (collapseTimeout) {
          clearTimeout(collapseTimeout)
          setCollapseTimeout(null)
        }
        setIsExpanded(true)
      }}
      onMouseLeave={() => {
        const timeout = setTimeout(() => setIsExpanded(false), 2500)
        setCollapseTimeout(timeout)
      }}
    >
      <div
        className={`
          bg-card-bg/95 backdrop-blur-md border border-gray-700 rounded-r-xl shadow-2xl
          transition-all duration-300 ease-in-out transform
          ${isExpanded ? 'w-80 translate-x-0' : 'w-16 -translate-x-1'}
          overflow-hidden
          ${isExpanded ? 'origin-top-left' : 'origin-center'}
        `}
      >
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="flex flex-col items-center justify-center h-16 w-16">
            <Github size={24} className="text-cyan-400 mb-2" />
            {totalUpdates > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalUpdates > 9 ? '9+' : totalUpdates}
              </div>
            )}
          </div>
        )}
        {/* Expanded State */}
        {isExpanded && (
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Github size={20} className="text-cyan-400" />
                <h3 className="text-white font-semibold text-sm">Latest Updates</h3>
              </div>
              <div className="flex items-center space-x-2">
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
            {/* Tabs */}
            <div className="flex bg-gray-800/30 rounded-md p-0.5 border border-gray-700/50 mb-3">
              <button
                onClick={() => setActiveTab('releases')}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-all duration-200 ${
                  activeTab === 'releases' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Tag size={12} />
                <span>Releases</span>
              </button>
              <button
                onClick={() => setActiveTab('commits')}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-all duration-200 ${
                  activeTab === 'commits' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <GitCommit size={12} />
                <span>Commits</span>
              </button>
            </div>
            {/* Content */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-xs">Loading updates...</p>
                </div>
              ) : (
                <>
                  {allUpdates.map((update, index) => (
                    <div key={`${update.resource.id}-${update.type}-${index}`} 
                         className="bg-gray-800/50 rounded-lg p-2 transition-all duration-200 hover:bg-gray-700/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <a
                          href={update.resource.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-xs text-cyan-400 hover:text-cyan-300 truncate max-w-[100px] flex-shrink-0 transition-colors"
                          title={`View ${update.resource.name} on GitHub`}
                        >
                          {update.resource.name}
                        </a>
                        {update.type === 'release' ? (
                          <Tag size={12} className="text-cyan-400 flex-shrink-0" />
                        ) : (
                          <GitCommit size={12} className="text-green-400 flex-shrink-0" />
                        )}
                        <a
                          href={update.data.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white text-xs truncate flex-1"
                        >
                          {update.type === 'release' ? update.data.name : update.data.message.split('\n')[0]}
                        </a>
                        <span className="text-gray-500 text-xs ml-auto flex-shrink-0">
                          {formatRelativeTime(update.type === 'release' ? update.data.publishedAt : update.data.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {allUpdates.length === 0 && (
                    <div className="text-center py-4">
                      <AlertCircle size={16} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs">No updates available</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GitHubUpdatesWidget 