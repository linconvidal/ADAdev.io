import React from 'react'
import ResourceCard from './ResourceCard'

const ResourceGrid = ({ category, resources }) => {
  return (
    <section id="categories" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Category header - Modal.com style */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {category}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {getCategoryDescription(category)}
          </p>
        </div>

        {/* Resources grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Helper function to get category descriptions
const getCategoryDescription = (category) => {
  const descriptions = {
    'Development Tools': 'Essential tools and platforms for building on Cardano, including smart contract languages and development frameworks.',
    'Infrastructure & APIs': 'Scalable APIs and infrastructure services to connect your applications with the Cardano blockchain.',
    'Wallets & User Tools': 'User-friendly wallets and tools for interacting with Cardano applications and managing digital assets.',
    'Security & Auditing': 'Security tools, audit frameworks, and best practices for secure Cardano development.',
    'Minting and NFTs': 'Infrastructure for creating, minting, and distributing NFTs and custom tokens on Cardano.',
    'Analytics & Data': 'Block explorers, analytics platforms, and data visualization tools for Cardano.',
    'Education & Documentation': 'Learning resources, tutorials, and comprehensive documentation for Cardano development.',
    'Identity & Authentication': 'Decentralized identity solutions and wallet-based authentication systems.',
    'Oracles & External Data': 'Reliable data feeds and oracle networks for connecting Cardano to real-world information.',
    'Privacy & Zero-Knowledge': 'Privacy-preserving tools and zero-knowledge proof implementations on Cardano.',
    'AI & Machine Learning': 'AI agent infrastructure and machine learning integration for Cardano applications.',
    'Development Platforms': 'All-in-one development platforms and deployment solutions for Cardano dApps.',
    'Community & Engagement': 'Tools for community management, engagement, and governance on Cardano.',
    'Core Infrastructure': 'Core blockchain infrastructure, node software, and fundamental Cardano components.'
  }
  return descriptions[category] || 'Explore these valuable resources for Cardano development.'
}

// Helper function to get category tags
const getCategoryTags = (category) => {
  const tags = {
    'Development Tools': ['Smart Contracts', 'SDKs', 'Frameworks'],
    'Infrastructure & APIs': ['Blockchain Data', 'APIs', 'Infrastructure'],
    'Wallets & User Tools': ['Wallets', 'Browser Extensions', 'DApp Tools'],
    'Security & Auditing': ['Security', 'Auditing', 'Best Practices'],
    'Minting and NFTs': ['NFTs', 'Tokenization', 'Token Creation'],
    'Analytics & Data': ['Analytics', 'Data', 'Explorers'],
    'Education & Documentation': ['Learning', 'Documentation', 'Tutorials'],
    'Identity & Authentication': ['Identity', 'Authentication', 'DID'],
    'Oracles & External Data': ['Oracles', 'Data Feeds', 'External Data'],
    'Privacy & Zero-Knowledge': ['Privacy', 'ZKPs', 'Confidentiality'],
    'AI & Machine Learning': ['AI', 'Machine Learning', 'Agents'],
    'Development Platforms': ['Platforms', 'Deployment', 'Infrastructure'],
    'Community & Engagement': ['Community', 'Engagement', 'Governance'],
    'Core Infrastructure': ['Core', 'Infrastructure', 'Nodes']
  }
  return tags[category] || ['Tools', 'Resources']
}

export default ResourceGrid 