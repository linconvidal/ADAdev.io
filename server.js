require('dotenv').config()

const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

// Enable CORS for all routes
app.use(cors())

// Add JSON body parsing middleware
app.use(express.json())

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// Application-level GitHub cache
const GITHUB_CACHE = {
  data: new Map(),
  timestamps: new Map(),
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  lastCleanup: Date.now()
}

// Cache cleanup function
const cleanupExpiredCache = () => {
  const now = Date.now()
  const expiredKeys = []
  
  for (const [key, timestamp] of GITHUB_CACHE.timestamps.entries()) {
    if (now - timestamp > GITHUB_CACHE.CACHE_DURATION) {
      expiredKeys.push(key)
    }
  }
  
  expiredKeys.forEach(key => {
    GITHUB_CACHE.data.delete(key)
    GITHUB_CACHE.timestamps.delete(key)
  })
  
  if (expiredKeys.length > 0) {
    console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`)
  }
  
  GITHUB_CACHE.lastCleanup = now
}

// Clean up expired cache every hour
setInterval(cleanupExpiredCache, 60 * 60 * 1000)

// GitHub API utilities
const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null // Use token if available

// Log token status (without exposing the actual token)
console.log(`🔐 GitHub Token Status: ${GITHUB_TOKEN ? '✅ Token available' : '❌ No token found'}`)
console.log(`🔐 Environment variables loaded: ${Object.keys(process.env).filter(key => key.includes('GITHUB')).join(', ')}`)
if (GITHUB_TOKEN) {
  console.log(`🔐 Token starts with: ${GITHUB_TOKEN.substring(0, 4)}...`)
}

// Rate limiting for server-side requests
let requestCount = 0
const MAX_REQUESTS_PER_HOUR = 60
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second between requests

const rateLimitedFetch = async (url, options = {}) => {
  const now = Date.now()
  
  // Rate limiting
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  requestCount++
  lastRequestTime = Date.now()
  
  console.log(`📡 Server making GitHub API request (${requestCount}/${MAX_REQUESTS_PER_HOUR}): ${url}`)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'adaDEV-Platform',
        ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` }),
        ...options.headers
      }
    })
    
    if (response.status === 429) {
      throw new Error('GitHub API rate limit exceeded')
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
    return response
  } catch (error) {
    console.error(`❌ GitHub API request failed: ${error.message}`)
    throw error
  }
}

// Extract repo path from GitHub URL
const extractRepoPath = (githubUrl) => {
  if (!githubUrl) return null
  
  // Handle organization URLs (e.g., https://github.com/masumi-network)
  const orgMatch = githubUrl.match(/github\.com\/([^\/]+)$/)
  if (orgMatch) {
    return orgMatch[1]
  }
  
  // Handle repository URLs (e.g., https://github.com/owner/repo)
  const repoMatch = githubUrl.match(/github\.com\/([^\/]+\/[^\/]+)/)
  return repoMatch ? repoMatch[1] : null
}

// Fetch latest releases
const fetchLatestReleases = async (repoPath, limit = 3) => {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/repos/${repoPath}/releases?per_page=${limit}`)
    const releases = await response.json()
    
    return releases.map(release => ({
      id: release.id,
      name: release.name || release.tag_name,
      tagName: release.tag_name,
      publishedAt: release.published_at,
      body: release.body,
      htmlUrl: release.html_url,
      prerelease: release.prerelease,
      draft: release.draft
    }))
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`⚠️ No releases found for ${repoPath} (repository might be private or moved)`)
    } else {
      console.error(`Error fetching releases for ${repoPath}:`, error)
    }
    return []
  }
}

// Fetch recent commits
const fetchRecentCommits = async (repoPath, limit = 5) => {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/repos/${repoPath}/commits?per_page=${limit}`)
    const commits = await response.json()
    
    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author,
      date: commit.commit.author.date,
      htmlUrl: commit.html_url,
      shortSha: commit.sha.substring(0, 7)
    }))
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`⚠️ No commits found for ${repoPath} (repository might be private or moved)`)
    } else {
      console.error(`Error fetching commits for ${repoPath}:`, error)
    }
    return []
  }
}

// Fetch repository information
const fetchRepositoryInfo = async (repoPath) => {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/repos/${repoPath}`)
    const repo = await response.json()
    
    return {
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      language: repo.language,
      pushedAt: repo.pushed_at,
      htmlUrl: repo.html_url
    }
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`⚠️ Repository info not found for ${repoPath} (repository might be private or moved)`)
    } else {
      console.error(`Error fetching repository info for ${repoPath}:`, error)
    }
    return null
  }
}

// Fetch organization repositories
const fetchOrganizationRepos = async (orgName, limit = 5) => {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/orgs/${orgName}/repos?sort=updated&per_page=${limit}`)
    const repos = await response.json()
    
    return repos.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      language: repo.language,
      pushedAt: repo.pushed_at,
      htmlUrl: repo.html_url,
      updatedAt: repo.updated_at
    }))
  } catch (error) {
    console.error(`Error fetching organization repos for ${orgName}:`, error)
    return []
  }
}

// Generate cache key for a resource
const generateCacheKey = (resource) => {
  const githubUrl = resource.social?.github
  if (!githubUrl) return null
  
  const repoPath = extractRepoPath(githubUrl)
  if (!repoPath) return null
  
  const normalizedName = resource.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `github_${normalizedName}_${repoPath.replace('/', '_')}`
}

// Get cached data for a resource
const getCachedData = (resource) => {
  const cacheKey = generateCacheKey(resource)
  if (!cacheKey) return null
  
  const cached = GITHUB_CACHE.data.get(cacheKey)
  const timestamp = GITHUB_CACHE.timestamps.get(cacheKey)
  
  if (cached && timestamp && (Date.now() - timestamp) < GITHUB_CACHE.CACHE_DURATION) {
    console.log(`📋 Server cache hit for ${resource.name}`)
    return cached
  }
  
  console.log(`❌ Server cache miss for ${resource.name}`)
  return null
}

// Set cached data for a resource
const setCachedData = (resource, data) => {
  const cacheKey = generateCacheKey(resource)
  if (!cacheKey) return false
  
  GITHUB_CACHE.data.set(cacheKey, data)
  GITHUB_CACHE.timestamps.set(cacheKey, Date.now())
  
  console.log(`💾 Server cached data for ${resource.name}`)
  return true
}

// Fetch GitHub updates for a resource (with caching)
const fetchGitHubUpdates = async (resource) => {
  const githubUrl = resource.social?.github
  if (!githubUrl) {
    return { releases: [], commits: [], repoInfo: null }
  }
  
  const repoPath = extractRepoPath(githubUrl)
  if (!repoPath) {
    return { releases: [], commits: [], repoInfo: null }
  }
  
  // Check cache first
  const cachedData = getCachedData(resource)
  if (cachedData) {
    return cachedData
  }
  
  console.log(`🔍 Server fetching fresh GitHub data for ${resource.name} (${repoPath})`)
  
  try {
    let releases = []
    let commits = []
    let repoInfo = null
    
    // Check if this is an organization URL
    if (!repoPath.includes('/')) {
      console.log(`🏢 Server detected organization: ${repoPath}`)
      const repos = await fetchOrganizationRepos(repoPath, 1)
      
      if (repos.length === 0) {
        return { releases: [], commits: [], repoInfo: null }
      }
      
      const mostActiveRepo = repos[0]
      console.log(`📦 Server using most active repo: ${mostActiveRepo.fullName}`)
      
      const [repoReleases, repoCommits] = await Promise.all([
        fetchLatestReleases(mostActiveRepo.fullName, 3),
        fetchRecentCommits(mostActiveRepo.fullName, 3)
      ])
      
      releases = repoReleases
      commits = repoCommits
      repoInfo = mostActiveRepo
    } else {
      console.log(`📦 Server detected repository: ${repoPath}`)
      
      const [repoReleases, repoCommits, repoInfo] = await Promise.all([
        fetchLatestReleases(repoPath, 3),
        fetchRecentCommits(repoPath, 3),
        fetchRepositoryInfo(repoPath)
      ])
      
      releases = repoReleases
      commits = repoCommits
    }
    
    const result = {
      releases,
      commits,
      repoInfo,
      lastUpdated: new Date().toISOString()
    }
    
    // Cache the result
    setCachedData(resource, result)
    
    console.log(`📊 Server ${resource.name} results:`, {
      releases: result.releases.length,
      commits: result.commits.length,
      repoInfo: repoInfo ? 'available' : 'skipped'
    })
    
    return result
  } catch (error) {
    console.error(`Server error fetching GitHub updates for ${resource.name}:`, error)
    return { releases: [], commits: [], repoInfo: null }
  }
}

// Import resources data for initial fetch
const fs = require('fs')

// Load resources data for initial fetch
const loadResourcesData = () => {
  try {
    // Read the resources.js file and extract the data
    const resourcesPath = path.join(__dirname, 'src', 'data', 'resources.js')
    const resourcesContent = fs.readFileSync(resourcesPath, 'utf8')
    
    // Extract the cardanoResources object using regex
    const resourcesMatch = resourcesContent.match(/export const cardanoResources = ({[\s\S]*});/)
    if (!resourcesMatch) {
      console.log('❌ Could not parse resources data')
      return []
    }
    
    // Evaluate the resources object (safe since it's our own file)
    const resourcesString = resourcesMatch[1]
    const resources = eval(`(${resourcesString})`)
    
    // Flatten all resources from all categories
    const allResources = []
    Object.values(resources).forEach(category => {
      if (Array.isArray(category)) {
        allResources.push(...category)
      }
    })
    
    // Filter resources with GitHub URLs
    const resourcesWithGitHub = allResources.filter(resource => 
      resource.social?.github
    )
    
    console.log(`📚 Loaded ${resourcesWithGitHub.length} resources with GitHub URLs`)
    return resourcesWithGitHub
  } catch (error) {
    console.error('❌ Error loading resources data:', error)
    return []
  }
}

// Initial data fetch function
const performInitialDataFetch = async () => {
  console.log('🚀 Starting initial GitHub data fetch...')
  
  const resources = loadResourcesData()
  if (resources.length === 0) {
    console.log('❌ No resources found for initial fetch')
    return
  }
  
  // Select top 15 most popular resources for initial fetch (increased from 10)
  const topResources = resources.slice(0, 15)
  console.log(`📊 Pre-loading cache for ${topResources.length} resources`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < topResources.length; i++) {
    const resource = topResources[i]
    try {
      console.log(`🔄 [${i + 1}/${topResources.length}] Fetching data for ${resource.name}...`)
      
      const data = await fetchGitHubUpdates(resource)
      
      if (data.releases.length > 0 || data.commits.length > 0) {
        console.log(`✅ ${resource.name}: ${data.releases.length} releases, ${data.commits.length} commits`)
        successCount++
      } else {
        console.log(`⚠️ ${resource.name}: No data available`)
      }
      
      // Add delay between requests to respect rate limits
      if (i < topResources.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      }
      
    } catch (error) {
      console.error(`❌ Error fetching data for ${resource.name}:`, error.message)
      errorCount++
    }
  }
  
  console.log(`🎉 Initial fetch complete: ${successCount} successful, ${errorCount} errors`)
  console.log(`📊 Cache now contains ${GITHUB_CACHE.data.size} entries`)
  
  // Start background process to load remaining resources
  setTimeout(() => {
    performBackgroundDataFetch(resources.slice(15))
  }, 5000) // 5 second delay before starting background fetch
}

// Background data fetch for remaining resources
const performBackgroundDataFetch = async (remainingResources) => {
  if (remainingResources.length === 0) {
    console.log('✅ No remaining resources to fetch')
    return
  }
  
  console.log(`🔄 Starting background fetch for ${remainingResources.length} remaining resources...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < remainingResources.length; i++) {
    const resource = remainingResources[i]
    try {
      console.log(`🔄 Background [${i + 1}/${remainingResources.length}] Fetching data for ${resource.name}...`)
      
      const data = await fetchGitHubUpdates(resource)
      
      if (data.releases.length > 0 || data.commits.length > 0) {
        console.log(`✅ Background ${resource.name}: ${data.releases.length} releases, ${data.commits.length} commits`)
        successCount++
      } else {
        console.log(`⚠️ Background ${resource.name}: No data available`)
      }
      
      // Longer delay for background fetch to be less aggressive
      if (i < remainingResources.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000)) // 3 second delay
      }
      
    } catch (error) {
      console.error(`❌ Background error fetching data for ${resource.name}:`, error.message)
      errorCount++
    }
  }
  
  console.log(`🎉 Background fetch complete: ${successCount} successful, ${errorCount} errors`)
  console.log(`📊 Cache now contains ${GITHUB_CACHE.data.size} entries`)
}

// API Routes

// Get GitHub updates for a specific resource
app.get('/api/github/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params
    
    // For now, we'll need to get the resource data from the client
    // In a real implementation, you'd have a resources database
    res.json({ 
      error: 'Resource not found',
      message: 'Please provide resource data in request body'
    })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get GitHub updates for a resource (POST with resource data)
app.post('/api/github/updates', async (req, res) => {
  try {
    console.log('📥 Received POST /api/github/updates with body:', JSON.stringify(req.body, null, 2))
    
    const resource = req.body
    
    if (!resource || !resource.name || !resource.social?.github) {
      console.log('❌ Invalid resource data:', { 
        hasResource: !!resource, 
        hasName: !!resource?.name, 
        hasGithub: !!resource?.social?.github 
      })
      return res.status(400).json({ 
        error: 'Invalid resource data',
        message: 'Resource must have name and social.github URL',
        received: req.body
      })
    }
    
    const data = await fetchGitHubUpdates(resource)
    res.json(data)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get global GitHub updates (aggregated from multiple resources)
app.post('/api/github/global', async (req, res) => {
  try {
    const { resources } = req.body
    
    if (!Array.isArray(resources)) {
      return res.status(400).json({ 
        error: 'Invalid resources data',
        message: 'Resources must be an array'
      })
    }
    
    const allData = []
    const maxResources = Math.min(5, resources.length) // Limit to 5 resources
    
    for (let i = 0; i < maxResources; i++) {
      const resource = resources[i]
      if (resource.social?.github) {
        try {
          const data = await fetchGitHubUpdates(resource)
          if (data.releases.length > 0 || data.commits.length > 0) {
            allData.push({
              resource,
              ...data
            })
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${resource.name}:`, error.message)
        }
      }
    }
    
    // Sort by latest activity
    const sortedData = allData.sort((a, b) => {
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
    
    res.json(sortedData)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get cache status
app.get('/api/github/cache/status', (req, res) => {
  const status = {
    entries: GITHUB_CACHE.data.size,
    lastCleanup: GITHUB_CACHE.lastCleanup,
    cacheDuration: GITHUB_CACHE.CACHE_DURATION,
    keys: Array.from(GITHUB_CACHE.data.keys())
  }
  res.json(status)
})

// Clear cache
app.post('/api/github/cache/clear', (req, res) => {
  GITHUB_CACHE.data.clear()
  GITHUB_CACHE.timestamps.clear()
  GITHUB_CACHE.lastCleanup = Date.now()
  console.log('🗑️ Server cache cleared')
  res.json({ message: 'Cache cleared successfully' })
})

// Trigger initial data fetch manually
app.post('/api/github/cache/preload', async (req, res) => {
  try {
    console.log('🔄 Manual cache preload triggered')
    await performInitialDataFetch()
    res.json({ 
      message: 'Cache preload completed',
      cacheEntries: GITHUB_CACHE.data.size
    })
  } catch (error) {
    console.error('Error during manual preload:', error)
    res.status(500).json({ error: 'Preload failed' })
  }
})

// Trigger background fetch for remaining resources
app.post('/api/github/cache/background-fetch', async (req, res) => {
  try {
    console.log('🔄 Manual background fetch triggered')
    const resources = loadResourcesData()
    const remainingResources = resources.slice(15) // Skip first 15 that were loaded initially
    
    // Start background fetch
    performBackgroundDataFetch(remainingResources)
    
    res.json({ 
      message: 'Background fetch started',
      remainingResources: remainingResources.length,
      currentCacheEntries: GITHUB_CACHE.data.size
    })
  } catch (error) {
    console.error('Error during background fetch:', error)
    res.status(500).json({ error: 'Background fetch failed' })
  }
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 GitHub cache initialized with ${GITHUB_CACHE.CACHE_DURATION / (60 * 60 * 1000)} hour duration`)
  
  // Start initial data fetch after server is running
  setTimeout(() => {
    performInitialDataFetch()
  }, 1000) // 1 second delay to ensure server is fully started
}) 