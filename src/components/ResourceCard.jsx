import React, { useState, useRef } from 'react'
import { 
  ExternalLink, Github, MessageCircle,
  TerminalSquare, Database, Wallet, Image as ImageIcon, Users,
  ShieldCheck, Zap, BarChart2, Bot, Moon, HardDrive, Building2,
  BookOpen, UserCheck, Eye, Cpu, Heart, Server, GitBranch
} from 'lucide-react'
import GitHubUpdates from './GitHubUpdates'

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
  </svg>
)

const DiscordIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.369A19.791 19.791 0 0016.885 3.2a.077.077 0 00-.082.038c-.357.63-.755 1.453-1.037 2.104a18.524 18.524 0 00-5.532 0 12.683 12.683 0 00-1.05-2.104.077.077 0 00-.082-.038A19.736 19.736 0 003.684 4.369a.07.07 0 00-.032.027C.533 9.09-.32 13.578.099 18.021a.082.082 0 00.031.056c2.128 1.563 4.195 2.507 6.222 3.13a.077.077 0 00.084-.027c.48-.66.908-1.356 1.273-2.084a.076.076 0 00-.041-.104c-.676-.256-1.32-.568-1.94-.936a.077.077 0 01-.008-.127c.13-.098.26-.2.384-.304a.074.074 0 01.077-.01c4.07 1.86 8.47 1.86 12.51 0a.075.075 0 01.078.009c.124.104.254.206.384.304a.077.077 0 01-.006.127 12.298 12.298 0 01-1.941.936.076.076 0 00-.04.105c.366.728.794 1.423 1.273 2.083a.076.076 0 00.084.028c2.028-.623 4.095-1.567 6.223-3.13a.077.077 0 00.03-.055c.5-5.177-.838-9.637-3.548-13.625a.062.062 0 00-.03-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.96 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.947 2.419-2.157 2.419z" fill="currentColor"/>
  </svg>
)

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
    case 'twitter':
    case 'x': return <XIcon />
    case 'github': return <Github size={14} />
    case 'discord': return <DiscordIcon />
    default: return <ExternalLink size={14} />
  }
}

const ResourceCard = ({ resource }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const hoverTimeoutRef = useRef(null)

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
      onMouseEnter={() => setActiveTab(tabName)}
      className={`px-3 py-1 text-sm rounded-md transition-all duration-200  ${
        activeTab === tabName 
          ? 'bg-gray-700/50 border-gray-600 text-white shadow-inner' 
          : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-800/50 '
      }`}
    >
      {children}
    </button>
  );

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 300) // 300ms delay before collapsing
  }

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative bg-card-bg/50 backdrop-blur-md border border-gray-800 rounded-xl p-4 transition-all duration-300 ease-in-out transform-gpu shadow-lg hover:shadow-2xl"
              style={{
          height: isHovered ? '20rem' : '6rem',
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