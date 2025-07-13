import React, { useState, useEffect } from 'react'
import { Plus, ExternalLink, Github, AlertCircle, CheckCircle, Copy } from 'lucide-react'

const initialForm = {
  name: '',
  logo: '',
  description: '',
  fullDescription: '',
  keySolutions: '', // comma-separated
  website: '',
  github: '',
  discord: '',
  x: '',
  docs: '',
  category: '',
  customTabTitle: '',
  customTabContent: ''
}

const AddResourceWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [collapseTimeout, setCollapseTimeout] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [codeSnippet, setCodeSnippet] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Handle click outside to collapse widget
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !event.target.closest('.add-resource-widget')) {
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

  // Generate code snippet
  const generateSnippet = () => {
    const {
      name, logo, description, fullDescription, keySolutions, website, github, discord, x, docs, category, customTabTitle, customTabContent
    } = form
    let obj = {
      id: '[next available id]',
      name,
      logo,
      description,
      fullDescription,
      keySolutions: keySolutions.split(',').map(s => s.trim()).filter(Boolean),
      website,
      social: {},
      category: customCategory || category
    }
    if (github) obj.social.github = github
    if (discord) obj.social.discord = discord
    if (x) obj.social.x = x
    if (docs) obj.docs = docs
    if (customTabTitle && customTabContent) {
      obj.customTab = { title: customTabTitle, content: customTabContent }
    }
    // Remove empty social
    if (Object.keys(obj.social).length === 0) delete obj.social
    // Format as JS
    return JSON.stringify(obj, null, 2)
      .replace(/"([^\"]+)":/g, '$1:') // remove quotes from keys
      .replace(/"/g, '"')
  }

  // Generate PR template
  const generatePRTemplate = (snippet) => {
    return `## New Resource Submission\n\nPlease review and copy the code snippet below into resources.js.\n\n\`\`\`javascript\n${snippet}\`\`\`\n\n---\n\n### Guidelines:\n- Ensure the resource is Cardano-related\n- Provide accurate and up-to-date information\n- Key Solutions should be a comma-separated list of keywords that describe the resource\n- Include all available social links\n- Use appropriate category\n- Ensure logo URL is accessible\n\nThank you for contributing to the Cardano developer ecosystem!`
  }

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    const snippet = generateSnippet()
    setCodeSnippet(snippet)
    setShowInstructions(true)
  }

  // Copy PR template to clipboard
  const handleCopy = async () => {
    const prTemplate = generatePRTemplate(codeSnippet)
    try {
      await navigator.clipboard.writeText(prTemplate)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1500)
    } catch {
      setCopySuccess(false)
    }
  }

  const categories = [
    "Libraries & Languages",
    "Infrastructure & APIs",
    "Minting and NFTs",
    "Security & Auditing",
    "Analytics & Data",
    "Education & Documentation",
    "Wallets & User Tools",
    "Identity & Authentication",
    "Oracles & External Data",
    "Privacy & Zero-Knowledge",
    "AI & Machine Learning",
    "Development Platforms",
    "Community & Engagement",
    "Core Infrastructure",
    "Layer 2 Scaling Solutions",
    "Governance & DAOs"
  ]

  return (
    <div 
      className={`fixed left-0 top-1/2 transform -translate-y-1/2 ${isExpanded ? 'z-[9999]' : 'z-40'} hidden lg:block add-resource-widget`}
      style={{ top: 'calc(50% + 80px)' }}
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
          ${isExpanded ? 'w-96 translate-x-0' : 'w-16 -translate-x-1'}
          overflow-hidden
          ${isExpanded ? 'origin-top-left' : 'origin-center'}
        `}
      >
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="flex flex-col items-center justify-center h-16 w-16">
            <Plus size={24} className="text-emerald-400 mb-2" />
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          </div>
        )}
        {/* Expanded State */}
        {isExpanded && (
          <div className="p-4 max-h-[85vh] overflow-y-auto pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Plus size={20} className="text-emerald-400" />
                <h3 className="text-white font-semibold text-sm">Add Resource</h3>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <Github size={14} />
                <span>PR</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full bg-gray-800 text-white rounded p-2 text-xs" required />
              <input name="logo" value={form.logo} onChange={handleChange} placeholder="Logo URL" className="w-full bg-gray-800 text-white rounded p-2 text-xs" required />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Short Description" className="w-full bg-gray-800 text-white rounded p-2 text-xs" required />
              <textarea name="fullDescription" value={form.fullDescription} onChange={handleChange} placeholder="Full Description" className="w-full bg-gray-800 text-white rounded p-2 text-xs" required />
              <input name="keySolutions" value={form.keySolutions} onChange={handleChange} placeholder="Key Solutions (comma separated)" className="w-full bg-gray-800 text-white rounded p-2 text-xs" required />
              <input name="website" value={form.website} onChange={handleChange} placeholder="Website" className="w-full bg-gray-800 text-white rounded p-2 text-xs" required />
              <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub URL" className="w-full bg-gray-800 text-white rounded p-2 text-xs" />
              <input name="discord" value={form.discord} onChange={handleChange} placeholder="Discord URL" className="w-full bg-gray-800 text-white rounded p-2 text-xs" />
              <input name="x" value={form.x} onChange={handleChange} placeholder="X (Twitter) URL" className="w-full bg-gray-800 text-white rounded p-2 text-xs" />
              <input name="docs" value={form.docs} onChange={handleChange} placeholder="Docs URL" className="w-full bg-gray-800 text-white rounded p-2 text-xs" />
              <select name="category" value={form.category} onChange={e => {
                handleChange(e)
                if (e.target.value !== 'Other') setCustomCategory('')
              }} className="w-full bg-gray-800 text-white rounded p-2 text-xs" required>
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {form.category === 'Other' && (
                <input
                  name="customCategory"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full bg-gray-800 text-white rounded p-2 text-xs"
                  required
                />
              )}
              <input name="customTabTitle" value={form.customTabTitle} onChange={handleChange} placeholder="Custom Tab Title (optional)" className="w-full bg-gray-800 text-white rounded p-2 text-xs" />
              <textarea name="customTabContent" value={form.customTabContent} onChange={handleChange} placeholder="Custom Tab Content (optional)" className="w-full bg-gray-800 text-white rounded p-2 text-xs" />
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group mt-4 mb-2"> <Github size={16} />
                <span>Create Pull Request</span>
              </button>
            </form>
            {codeSnippet && (
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                  <span>Prefilled PR Template:</span>
                  <button onClick={handleCopy} title="Copy PR template" className="ml-2 p-1 rounded hover:bg-gray-700">
                    {copySuccess ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <pre className="bg-gray-900/80 text-gray-200 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap"><code>{generatePRTemplate(codeSnippet)}</code></pre>
              </div>
            )}
            {showInstructions && (
              <div className="mt-3 text-xs text-gray-300 space-y-1 border-t border-gray-700 pt-3">
                <div className="font-semibold mb-1">Next steps:</div>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Fork repo <a href="https://github.com/SLFMR1/ADAdev.io/fork" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">(link)</a></li>
                  <li>Add to <span className="font-mono">resources.js</span></li>
                  <li>Push</li>
                  <li>Open PR</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddResourceWidget 