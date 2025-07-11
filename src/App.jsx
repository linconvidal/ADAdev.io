import React, { useState, useMemo, useEffect } from 'react'

import Header from './components/Header'
import Hero from './components/Hero'
import GitHubUpdatesWidget from './components/GitHubUpdatesWidget'
import SearchBar from './components/SearchBar'
import ResourceCard from './components/ResourceCard'
import AIResults from './components/AIResults'
import AIWidget from './components/AIWidget'
import Footer from './components/Footer'
import { cardanoResources } from './data/resources'
import { preloadCache, initializeRateLimit } from './services/github'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [aiResults, setAiResults] = useState(null)
  const [showAIWidget, setShowAIWidget] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)

  // Get all categories
  const categories = ['All', ...Object.keys(cardanoResources).sort()]

  // Flatten all resources with category info
  const allResources = useMemo(() => {
    return Object.entries(cardanoResources).flatMap(([category, resources]) =>
      resources.map(resource => ({ ...resource, category }))
    )
  }, [])

  // Initialize GitHub API and preload cache on app startup
  useEffect(() => {
    const initializeGitHub = async () => {
      // Initialize rate limit status first
      await initializeRateLimit()
      
      // Then preload cache
      const resourcesWithGitHub = allResources.filter(resource => resource.social?.github)
      if (resourcesWithGitHub.length > 0) {
        // Preload cache in the background
        preloadCache(resourcesWithGitHub)
      }
    }
    
    initializeGitHub()
  }, [allResources])

  // Handle AI analysis completion
  const handleAIAnalysisComplete = (results) => {
    setAiResults(results)
    // Clear any existing search/filter when AI results are shown
    setSearchTerm('')
    setSelectedCategory('All')
  }

  // Handle AI loading state
  const handleAILoadingChange = (loading) => {
    setIsAILoading(loading)
  }

  // Filter resources based on search and category
  const filteredResources = useMemo(() => {
    let filtered = allResources

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.keySolutions?.some(solution => 
          solution.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    return filtered
  }, [allResources, searchTerm, selectedCategory])

  // Group filtered resources by category for display
  const groupedResources = useMemo(() => {
    const grouped = {}
    filteredResources.forEach(resource => {
      if (!grouped[resource.category]) {
        grouped[resource.category] = []
      }
      grouped[resource.category].push(resource)
    })
    return grouped
  }, [filteredResources])

  return (
    <div className="min-h-screen bg-custom-bg">
      <Header />
      <Hero 
        onAIAnalysisComplete={handleAIAnalysisComplete}
        onAILoadingChange={handleAILoadingChange}
      />
      
      {/* GitHub Updates Widget */}
      <GitHubUpdatesWidget />
      
      {/* AI Results Section - Show when AI results are available */}
      {aiResults && (
        <section id="ai-results">
          <AIResults 
            aiResults={aiResults}
            onOpenWidget={() => setShowAIWidget(true)}
          />
        </section>
      )}
      
      <main>
          {/* Resources Section - "Second Page" */}
          <section id="resources" className="min-h-screen bg-custom-bg py-20">
            <div className="max-w-6xl mx-auto px-4">
              {/* Resources Header */}
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Developer Resources
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
                  Comprehensive collection of tools, APIs, and libraries for building on Cardano
                </p>
                
                {/* Search Bar in Resources Section */}
                <div className="max-w-3xl mx-auto mb-16">
                  <SearchBar 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                  />
                </div>
              </div>

              {/* Resources Grid */}
              {Object.keys(groupedResources).length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-4">No resources found</h3>
                  <p className="text-lg text-gray-400">Try adjusting your search terms or category filter.</p>
                </div>
              ) : (
                <div className="space-y-20">
                  {Object.entries(groupedResources)
                    .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
                    .map(([category, resources]) => (
                    <div key={category}>
                      <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                          {category}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
                        {resources.map((resource) => (
                          <ResourceCard key={resource.id} resource={resource} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      
      {/* AI Widget Modal */}
      {showAIWidget && aiResults && (
        <AIWidget 
          aiResults={aiResults}
          onClose={() => setShowAIWidget(false)}
        />
      )}
      
      <Footer />
    </div>
  )
}

export default App 