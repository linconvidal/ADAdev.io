import React, { useState, useRef, useEffect } from 'react'
import { Search, Sparkles, Loader2 } from 'lucide-react'
import { analyzeUserRequirements } from '../services/ai'

const AISearchInput = ({ onAnalysisComplete, onLoadingChange }) => {
  const [inputValue, setInputValue] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const progressInterval = useRef(null)

  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0)
      const startTime = Date.now()
      
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        
        // Start fast, then slow down gradually
        let progressPercent
        if (elapsed < 10000) {
          // First 10 seconds: 0% to 70%
          progressPercent = (elapsed / 10000) * 70
        } else if (elapsed < 20000) {
          // 10-20 seconds: 70% to 90%
          const remaining = elapsed - 10000
          progressPercent = 70 + (remaining / 10000) * 20
        } else {
          // After 20 seconds: 90% to 98% (very slow)
          const extraTime = elapsed - 20000
          const slowProgress = Math.min(extraTime / 10000, 8) // Additional 8% over 10 seconds
          progressPercent = 90 + slowProgress
        }
        
        setProgress(progressPercent)
      }, 100)
    } else {
      setProgress(0)
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [isAnalyzing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim()) {
      setError('Please describe what you want to build')
      return
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      setError('OpenAI API key not configured')
      return
    }

    setIsAnalyzing(true)
    setError('')
    onLoadingChange?.(true)
    setProgress(0)

    try {
      const results = await analyzeUserRequirements(inputValue)
      setProgress(100)
      
      // Wait for progress bar animation to complete (500ms) plus a small delay for visual feedback
      setTimeout(() => {
        setIsAnalyzing(false)
        onAnalysisComplete?.(results)
        
        // Add a small delay before scrolling to let the user see the completion
        setTimeout(() => {
          const element = document.getElementById('ai-results')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 200) // Small delay to let user see the completed state
      }, 700) // Wait 700ms total: 500ms for animation + 200ms buffer
      
    } catch (err) {
      setError(err.message || 'Failed to analyze requirements')
      setIsAnalyzing(false)
    } finally {
      onLoadingChange?.(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative w-full rounded-full border border-gray-700 bg-card-bg/50 backdrop-blur-md pl-10 pr-8 py-4">
          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 transition-all duration-500 shadow-lg shadow-cyan-400/25"
                style={{ width: `${progress}%`, minWidth: progress > 0 ? '8px' : 0 }}
              />
            </div>
          )}
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          {/* AI Icon */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </div>
          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe what you want to build..."
            className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-none focus:shadow-none transition-all duration-200 text-lg relative z-10 pr-10"
            disabled={isAnalyzing}
            style={{ 
              position: 'relative',
              outline: 'none',
              boxShadow: 'none'
            }}
          />
          {/* Submit Button */}
          {!isAnalyzing && (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 text-black px-6 py-5 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-custom-bg disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-500 hover:via-cyan-500 hover:to-sky-500 hover:scale-105 active:scale-95 z-40"
            >
            </button>
          )}
        </div>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className="mt-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      
      {/* Help Text */}
      <div className="mt-4 text-center">
      </div>
    </div>
  )
}

export default AISearchInput 