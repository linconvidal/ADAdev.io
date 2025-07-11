import React, { useState } from 'react'
import { 
  ExternalLink, Github, Twitter, MessageCircle,
  TerminalSquare, Database, Wallet, Image as ImageIcon, Users,
  ShieldCheck, Zap, BarChart2, Bot, Moon, HardDrive, Building2,
  BookOpen, UserCheck, Eye, Cpu, Heart, Server, GitBranch
} from 'lucide-react'
import GitHubUpdates from './GitHubUpdates'

const categoryIconComponents = {
  "Development Tools": TerminalSquare,
  "Infrastructure & APIs": Database,
  "Wallets & User Tools": Wallet,
  "Security & Auditing": ShieldCheck,
  "Minting and NFTs": ImageIcon,
  "Analytics & Data": BarChart2,
  "Education & Documentation": BookOpen,
  "Identity & Authentication": UserCheck,
  "Oracles & External Data": Zap,
  "Privacy & Zero-Knowledge": Moon,
  "AI & Machine Learning": Bot,
  "Development Platforms": HardDrive,
  "Community & Engagement": Heart,
  "Core Infrastructure": Server,
  default: TerminalSquare
};

const getSocialIcon = (platform) => {
  switch (platform) {
    case 'twitter': return <Twitter size={14} />
    case 'github': return <Github size={14} />
    case 'discord': return <MessageCircle size={14} />
    default: return <ExternalLink size={14} />
  }
}

const ResourceCard = ({ resource }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  const IconComponent = categoryIconComponents[resource.category] || categoryIconComponents.default;

  // Placeholder logo component
  const PlaceholderLogo = ({ name, className = "" }) => (
    <div className={`flex items-center justify-center bg-gray-700 rounded-md ${className}`}>
      <Building2 size={16} className="text-gray-400" />
    </div>
  );

  const TabButton = ({ tabName, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-3 py-1 text-sm rounded-md transition-all duration-200  ${
        activeTab === tabName 
          ? 'bg-gray-700/50 border-gray-600 text-white shadow-inner' 
          : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-800/50 '
      }`}
    >
      {children}
    </button>
  );

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-card-bg/50 backdrop-blur-md border border-gray-800 rounded-xl p-4 transition-all duration-300 ease-in-out transform-gpu shadow-lg hover:shadow-2xl"
              style={{
          height: isHovered ? '12rem' : '6rem',
          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
          zIndex: isHovered ? 10 : 1,
        }}
    >
      {/* Collapsed View */}
      <div className={`transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <IconComponent size={28} className="text-gray-400" />
            <div className="flex-1">
              <h3 className="text-white font-medium text-base mb-1">{resource.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{resource.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      <div className={`absolute top-0 left-0 w-full h-full p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <IconComponent size={28} className="text-cyan-400" />
              <h3 className="text-white font-medium text-base">{resource.name}</h3>
            </div>
            {/* Logo in expanded view */}
            {resource.website ? (
              <a 
                href={resource.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity duration-200"
                aria-label={`Visit ${resource.name} website`}
              >
                {resource.logo ? (
                  <img src={resource.logo} alt={`${resource.name} logo`} className="h-6 w-auto max-w-[80px] object-contain" />
                ) : (
                  <PlaceholderLogo name={resource.name} className="h-6 w-16" />
                )}
              </a>
            ) : (
              resource.logo ? (
                <img src={resource.logo} alt={`${resource.name} logo`} className="h-6 w-auto max-w-[80px] object-contain" />
              ) : (
                <PlaceholderLogo name={resource.name} className="h-6 w-16" />
              )
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-3 border-b border-gray-700/50">
            <TabButton tabName="about">About</TabButton>
            <TabButton tabName="solutions">Solutions</TabButton>
            <TabButton tabName="links">Links</TabButton>
            {resource.social?.github && (
              <TabButton tabName="updates">Updates</TabButton>
            )}
          </div>

          {/* Tab Content */}
          <div className={`flex-grow overflow-hidden text-sm text-gray-300 pr-2 ${activeTab === 'updates' ? 'overflow-y-auto' : ''}`}>
            {activeTab === 'about' && <p>{resource.fullDescription || resource.description}</p>}
            {activeTab === 'solutions' && (
              <div className="flex flex-wrap gap-1">
                {resource.keySolutions.map((solution) => (
                  <span key={solution} className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700">
                    {solution}
                  </span>
                ))}
              </div>
            )}
            {activeTab === 'links' && (
              <div className="flex flex-col space-y-2">
                {resource.website && (
                   <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-cyan-300">
                     <ExternalLink size={14} /> <span>Website</span>
                   </a>
                )}
                {resource.social && Object.entries(resource.social).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-cyan-300 capitalize">
                    {getSocialIcon(platform)} <span>{platform}</span>
                  </a>
                ))}
              </div>
            )}
            {activeTab === 'updates' && resource.social?.github && (
              <GitHubUpdates resource={resource} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceCard 