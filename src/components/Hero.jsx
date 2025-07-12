import React from 'react'
import { ArrowRight } from 'lucide-react'
import BlockAnimation from './BlockAnimation'
import AISearchInput from './AISearchInput'
import ADAdevLogo from '../../ADAdev_logo.png'

const Hero = ({ onAIAnalysisComplete, onAILoadingChange }) => {
  const scrollToResources = () => {
    const element = document.getElementById('resources')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" role="banner">
      {/* Logo in top left */}
      <a href="/" tabIndex={-1} aria-label="ADAdev Home">
        <img 
          src={ADAdevLogo} 
          alt="ADAdev Cardano Developer Resources Logo" 
          className="absolute top-6 left-6 w-32 h-20 z-20 rounded-xl shadow-lg bg-black/10 p-2 border border-white/10"
          width="128" height="80"
          loading="eager"
        />
      </a>
      <BlockAnimation />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            {/* Main headline */}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Cardano Developer{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">Resources</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Share your idea with us and we’ll guide you to the right Cardano stack. Or just browse below.            </p>

            {/* AI Search Input */}
            <AISearchInput 
              onAnalysisComplete={onAIAnalysisComplete}
              onLoadingChange={onAILoadingChange}
            />

            {/* CTA buttons */}
            <div className="flex justify-center">
              <button 
                onClick={scrollToResources}
                className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>Browse resources</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </section>
  )
}

export default Hero 