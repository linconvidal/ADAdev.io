import OpenAI from 'openai'
import { cardanoResources } from '../data/resources'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

/**
 * Filter resources based on user input keywords
 * @param {Array} allResources - All available resources
 * @param {string} userInput - User's input
 * @returns {Array} - Filtered resources
 */
const filterRelevantResources = (allResources, userInput) => {
  const inputLower = userInput.toLowerCase()
  const keywords = inputLower.split(' ').filter(word => word.length > 2)
  
  // Define category priorities based on keywords
  const categoryPriorities = {
    'smart contract': ['Development Tools', 'Libraries & Languages'],
    'defi': ['Development Tools', 'Infrastructure & APIs', 'Wallets & User Tools'],
    'nft': ['Minting and NFTs', 'Development Tools'],
    'wallet': ['Wallets & User Tools', 'Development Tools'],
    'api': ['Infrastructure & APIs', 'Development Tools'],
    'security': ['Security & Auditing', 'Development Tools'],
    'ai': ['AI & Machine Learning', 'Development Tools'],
    'oracle': ['Oracles & External Data', 'Infrastructure & APIs'],
    'privacy': ['Privacy & Zero-Knowledge', 'Security & Auditing'],
    'identity': ['Identity & Authentication', 'Security & Auditing'],
    'analytics': ['Analytics & Data', 'Infrastructure & APIs'],
    'education': ['Education & Documentation'],
    'community': ['Community & Engagement'],
    'infrastructure': ['Core Infrastructure', 'Infrastructure & APIs'],
    'scaling': ['Layer 2 Scaling Solutions', 'Infrastructure & APIs'],
    'governance': ['Governance & DAOs', 'Community & Engagement']
  }
  
  // Score resources based on relevance
  const scoredResources = allResources.map(resource => {
    let score = 0
    
    // Check category priority
    for (const [keyword, priorityCategories] of Object.entries(categoryPriorities)) {
      if (inputLower.includes(keyword) && priorityCategories.includes(resource.category)) {
        score += 10
      }
    }
    
    // Check name and description matches
    if (resource.name.toLowerCase().includes(inputLower)) score += 5
    if (resource.description.toLowerCase().includes(inputLower)) score += 3
    
    // Check key solutions
    resource.keySolutions.forEach(solution => {
      if (solution.toLowerCase().includes(inputLower)) score += 2
    })
    
    return { ...resource, relevanceScore: score }
  })
  
  // Sort by relevance and return top 30
  return scoredResources
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 30)
    .map(({ relevanceScore, ...resource }) => resource)
}

/**
 * Analyze user requirements and find relevant Cardano tools
 * @param {string} userInput - User's description of what they want to build
 * @returns {Promise<Object>} - Analysis results with recommended tools and plan
 */
export const analyzeUserRequirements = async (userInput) => {
  try {
    // Flatten all resources for analysis
    const allResources = Object.entries(cardanoResources).flatMap(([category, resources]) =>
      resources.map(resource => ({ ...resource, category }))
    )

    // Filter to most relevant resources
    const relevantResources = filterRelevantResources(allResources, userInput)

    // Create a concise resource summary for the AI
    const resourceSummary = relevantResources.map(resource => ({
      name: resource.name,
      category: resource.category,
      description: resource.description,
      keySolutions: resource.keySolutions
    }))

    const prompt = `
You are a Cardano development expert. A developer wants to build something on Cardano.

User Requirements: "${userInput}"

Available Cardano Tools (most relevant):
${JSON.stringify(resourceSummary, null, 2)}

Analyze the user's requirements and return a JSON object with this structure:
{
  "analysis": "Brief analysis of what the user wants to build",
  "recommendedTools": [
    {
      "resource": "Resource name from the list",
      "reason": "Why this tool is recommended",
      "priority": "high|medium|low"
    }
  ],
  "developmentPlan": {
    "overview": "Brief overview of the development approach",
    "approaches": [
      {
        "name": "Approach name",
        "description": "Description of this approach",
        "tools": ["List of tools for this approach"],
        "complexity": "beginner|intermediate|advanced"
      }
    ]
  }
}

Keep the response concise and focus on the most relevant tools.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a Cardano development expert. Provide accurate, practical advice for building on Cardano. Always return valid JSON. Keep responses concise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    const response = completion.choices[0].message.content
    const parsedResponse = JSON.parse(response)

    // Map recommended tools back to actual resource objects
    const recommendedResources = parsedResponse.recommendedTools
      .map(rec => {
        const resource = allResources.find(r => r.name === rec.resource)
        return resource ? { ...resource, reason: rec.reason, priority: rec.priority } : null
      })
      .filter(Boolean)

    return {
      analysis: parsedResponse.analysis,
      recommendedResources,
      developmentPlan: parsedResponse.developmentPlan
    }

  } catch (error) {
    console.error('AI analysis error:', error)
    
    // Provide a fallback response if AI fails
    if (error.message.includes('context length') || error.message.includes('tokens')) {
      throw new Error('Request too complex. Please try a more specific description of what you want to build.')
    }
    
    throw new Error('Failed to analyze requirements. Please try again.')
  }
}

/**
 * Generate a markdown development plan
 * @param {Object} aiResults - Results from analyzeUserRequirements
 * @returns {string} - Markdown formatted development plan
 */
export const generateMarkdownPlan = (aiResults) => {
  const { analysis, recommendedResources, developmentPlan } = aiResults

  let markdown = `# Cardano Development Plan\n\n`

  // Analysis section
  markdown += `## Project Analysis\n\n`
  markdown += `${analysis}\n\n`

  // Recommended tools section
  markdown += `## Recommended Tools\n\n`
  recommendedResources.forEach((resource, index) => {
    markdown += `### ${index + 1}. ${resource.name}\n`
    markdown += `**Category:** ${resource.category}\n\n`
    markdown += `**Description:** ${resource.description}\n\n`
    markdown += `**Why Recommended:** ${resource.reason}\n\n`
    markdown += `**Priority:** ${resource.priority}\n\n`
    markdown += `**Website:** ${resource.website}\n\n`
    if (resource.docs) {
      markdown += `**Documentation:** ${resource.docs}\n\n`
    }
    markdown += `---\n\n`
  })

  // Development approaches section
  markdown += `## Development Approaches\n\n`
  markdown += `${developmentPlan.overview}\n\n`

  developmentPlan.approaches.forEach((approach, index) => {
    markdown += `### Approach ${index + 1}: ${approach.name}\n\n`
    markdown += `**Description:** ${approach.description}\n\n`
    markdown += `**Complexity:** ${approach.complexity}\n\n`
    markdown += `**Required Tools:**\n`
    approach.tools.forEach(tool => {
      markdown += `- ${tool}\n`
    })
    markdown += `\n---\n\n`
  })

  markdown += `---\n\n`
  markdown += `*Generated by ADAdev AI Assistant*\n`

  return markdown
}

/**
 * Search resources based on AI recommendations
 * @param {Array} recommendedResources - AI recommended resources
 * @returns {Object} - Grouped resources by category
 */
export const getAIRecommendedResources = (recommendedResources) => {
  const grouped = {}
  
  recommendedResources.forEach(resource => {
    if (!grouped[resource.category]) {
      grouped[resource.category] = []
    }
    grouped[resource.category].push(resource)
  })

  return grouped
} 