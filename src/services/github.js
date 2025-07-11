const GITHUB_API_BASE = 'https://api.github.com'

// GitHub API configuration
const GITHUB_TOKEN = null // No token for free usage
const IS_AUTHENTICATED = false

// Rate limiting utilities optimized for unauthenticated GitHub API
let requestCount = 0
const MAX_REQUESTS_PER_HOUR = 60 // GitHub's limit for unauthenticated requests
const REQUEST_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // Reduced to 1 second - GitHub doesn't require delays between requests

// Cache for GitHub data
const CACHE_KEY = 'github-updates-cache'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour cache

// Rate limit tracking from GitHub headers
let currentRateLimit = {
  limit: 60,
  remaining: 60,
  reset: 0,
  used: 0
}

// Load cache from localStorage
const loadCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      const now = Date.now()
      // Filter out expired entries
      const validEntries = Object.entries(parsed).filter(([key, value]) => {
        return (now - value.timestamp) < CACHE_DURATION
      })
      return Object.fromEntries(validEntries)
    }
  } catch (error) {
    console.warn('Failed to load GitHub cache:', error)
  }
  return {}
}

// Save cache to localStorage
const saveCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('Failed to save GitHub cache:', error)
  }
}

// Initialize cache from localStorage
let githubCache = new Map(Object.entries(loadCache()))

// Global cache for all GitHub updates
const GLOBAL_CACHE_KEY = 'github-global-updates-cache'
const GLOBAL_CACHE_DURATION = 24 * 60 * 60 * 1000 // 1 day in ms
const MAX_RELEASES = 25
const MAX_COMMITS = 25

// Load global cache
const loadGlobalCache = () => {
  try {
    const cached = localStorage.getItem(GLOBAL_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < GLOBAL_CACHE_DURATION) {
        return parsed
      }
    }
  } catch (e) {}
  return { releases: [], commits: [], timestamp: 0 }
}

// Save global cache
const saveGlobalCache = (cache) => {
  try {
    localStorage.setItem(GLOBAL_CACHE_KEY, JSON.stringify(cache))
  } catch (e) {}
}

let globalCache = loadGlobalCache()

export const getCachedGlobalGitHubData = () => {
  return globalCache
}

export const clearGlobalGitHubCache = () => {
  globalCache = { releases: [], commits: [], timestamp: 0 }
  localStorage.removeItem(GLOBAL_CACHE_KEY)
}

// Helper to add new items and keep max size
function addToRollingList(list, newItems, max) {
  // Remove duplicates by id/sha
  const seen = new Set(list.map(item => item.id || item.sha))
  const filtered = newItems.filter(item => !(seen.has(item.id || item.sha)))
  const combined = [...filtered, ...list]
  return combined.slice(0, max)
}

// Fetch and update global cache
export const fetchAndCacheGlobalGitHubUpdates = async (resources) => {
  let allReleases = globalCache.releases
  let allCommits = globalCache.commits
  for (const resource of resources) {
    const githubUrl = resource.social?.github
    if (!githubUrl) continue
    const repoPath = extractRepoPath(githubUrl)
    if (!repoPath) continue
    try {
      let releases = []
      let commits = []
      if (!repoPath.includes('/')) {
        // Org: get most active repo
        const repos = await fetchOrganizationRepos(repoPath, 1)
        if (repos.length === 0) continue
        const mostActiveRepo = repos[0]
        releases = await fetchLatestReleases(mostActiveRepo.fullName, 3)
        commits = await fetchRecentCommits(mostActiveRepo.fullName, 3)
        releases = releases.map(r => ({ ...r, project: resource.name }))
        commits = commits.map(c => ({ ...c, project: resource.name }))
      } else {
        releases = await fetchLatestReleases(repoPath, 3)
        commits = await fetchRecentCommits(repoPath, 3)
        releases = releases.map(r => ({ ...r, project: resource.name }))
        commits = commits.map(c => ({ ...c, project: resource.name }))
      }
      allReleases = addToRollingList(allReleases, releases, MAX_RELEASES)
      allCommits = addToRollingList(allCommits, commits, MAX_COMMITS)
    } catch (e) {}
  }
  globalCache = {
    releases: allReleases,
    commits: allCommits,
    timestamp: Date.now()
  }
  saveGlobalCache(globalCache)
  return globalCache
}

/**
 * Check current rate limit status
 */
export const checkRateLimitStatus = async () => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'adaDEV-Platform',
        ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      const core = data.resources.core
      
      // Update our rate limit tracking
      currentRateLimit = {
        limit: core.limit,
        remaining: core.remaining,
        reset: core.reset,
        used: core.used
      }
      
      console.log('📊 GitHub Rate Limit Status:')
      console.log(`  Limit: ${core.limit}`)
      console.log(`  Remaining: ${core.remaining}`)
      console.log(`  Reset: ${new Date(core.reset * 1000).toLocaleString()}`)
      console.log(`  Used: ${core.used}`)
      
      return currentRateLimit
    }
  } catch (error) {
    console.warn('Failed to check rate limit status:', error)
  }
  
  return null
}

/**
 * Initialize rate limit status on startup
 */
export const initializeRateLimit = async () => {
  console.log('🚀 Initializing GitHub API rate limit status...')
  await checkRateLimitStatus()
}

/**
 * Debug function to inspect cache contents
 */
export const debugCache = () => {
  console.log('🔍 GitHub Cache Debug:')
  console.log('Cache size:', githubCache.size)
  console.log('Cache entries:')
  
  for (const [key, value] of githubCache.entries()) {
    const age = Date.now() - value.timestamp
    const ageMinutes = Math.round(age / 60000)
    const isValid = age < CACHE_DURATION
    
    console.log(`  ${key}:`)
    console.log(`    Age: ${ageMinutes} minutes`)
    console.log(`    Valid: ${isValid}`)
    console.log(`    Releases: ${value.data.releases.length}`)
    console.log(`    Commits: ${value.data.commits.length}`)
  }
  
  console.log('Cache duration:', CACHE_DURATION / 60000, 'minutes')
}

/**
 * Reload cache from localStorage to ensure synchronization
 */
export const reloadCache = () => {
  console.log('🔄 Reloading GitHub cache from localStorage...')
  const loadedCache = loadCache()
  githubCache = new Map(Object.entries(loadedCache))
  console.log(`📊 Cache reloaded with ${githubCache.size} entries`)
  return githubCache
}

/**
 * Check cache status for a specific resource
 */
export const checkCacheStatus = (resource) => {
  const githubUrl = resource.social?.github
  if (!githubUrl) {
    console.log(`❌ No GitHub URL for ${resource.name}`)
    return null
  }
  
  const repoPath = extractRepoPath(githubUrl)
  if (!repoPath) {
    console.log(`❌ Could not extract repo path from ${githubUrl} for ${resource.name}`)
    return null
  }
  
  const cacheKey = `${resource.name}-${repoPath}`
  const cachedData = githubCache.get(cacheKey)
  
  console.log(`🔍 Cache status for ${resource.name}:`)
  console.log(`  Cache key: ${cacheKey}`)
  console.log(`  Has cache entry: ${!!cachedData}`)
  
  if (cachedData) {
    const age = Date.now() - cachedData.timestamp
    const ageMinutes = Math.round(age / 60000)
    const isValid = age < CACHE_DURATION
    
    console.log(`  Cache age: ${ageMinutes} minutes`)
    console.log(`  Cache valid: ${isValid}`)
    console.log(`  Releases: ${cachedData.data.releases.length}`)
    console.log(`  Commits: ${cachedData.data.commits.length}`)
  }
  
  return cachedData
}

/**
 * Preload cache for common resources to improve initial load performance
 */
export const preloadCache = async (resources) => {
  console.log('🔄 Preloading cache for unauthenticated GitHub API...')
  const resourcesWithGitHub = resources.filter(resource => resource.social?.github)
  
  // Process up to 3 resources for better coverage
  const maxPreload = 3
  
  for (const resource of resourcesWithGitHub.slice(0, maxPreload)) {
    const cachedData = getCachedGitHubData(resource)
    if (!cachedData) {
      console.log(`📦 Preloading cache for ${resource.name}`)
      try {
        await fetchGitHubUpdates(resource)
        // Minimal delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1s delay
      } catch (error) {
        console.warn(`Failed to preload cache for ${resource.name}:`, error.message)
      }
    }
  }
}

// Service Worker cache utilities
const CACHE_NAME = 'github-updates-v1'

/**
 * Clear Service Worker cache
 */
export const clearCache = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }
  return { success: false }
}

/**
 * Check if cached data exists for a resource
 * @param {Object} resource - Resource object with social.github URL
 * @returns {Object|null} - Cached data or null if not found/expired
 */
export const getCachedGitHubData = (resource) => {
  const githubUrl = resource.social?.github
  if (!githubUrl) return null
  
  const repoPath = extractRepoPath(githubUrl)
  if (!repoPath) return null
  
  const cacheKey = `${resource.name}-${repoPath}`
  console.log(`🔍 Cache lookup for: ${resource.name} -> ${cacheKey}`)
  
  const cachedData = githubCache.get(cacheKey)
  
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log(`📋 Found valid cached data for ${resource.name}`)
    return cachedData.data
  } else if (cachedData) {
    console.log(`⏰ Cache expired for ${resource.name} (age: ${Date.now() - cachedData.timestamp}ms)`)
  } else {
    console.log(`❌ No cache entry found for ${resource.name}`)
  }
  
  return null
}

/**
 * Clear GitHub cache
 */
export const clearGitHubCache = () => {
  githubCache.clear()
  localStorage.removeItem(CACHE_KEY)
  console.log('🗑️ GitHub cache cleared')
}

/**
 * Check if Service Worker is available
 */
export const isServiceWorkerAvailable = () => {
  return 'serviceWorker' in navigator
}

/**
 * Rate limiting function to prevent hitting GitHub API limits
 */
const rateLimitedFetch = async (url, options = {}, retryCount = 0) => {
  const now = Date.now()
  
  // Check if we need to wait for rate limit reset
  if (currentRateLimit.remaining <= 0) {
    const resetTime = currentRateLimit.reset * 1000
    const waitTime = resetTime - now + 1000 // Add 1 second buffer
    if (waitTime > 0) {
      console.log(`⏳ Rate limit exhausted, waiting ${Math.round(waitTime/1000)}s until reset`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  // Minimal interval between requests (1 second)
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    console.log(`⏳ Rate limiting: waiting ${Math.round(waitTime/1000)}s before next request`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  requestCount++
  lastRequestTime = Date.now()
  
  console.log(`📡 Making GitHub API request (${requestCount}/${MAX_REQUESTS_PER_HOUR}): ${url}`)
  console.log(`🔐 Authentication: Unauthenticated (Free Tier)`)
  
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
    
    // Update rate limit from GitHub headers
    const remaining = response.headers.get('X-RateLimit-Remaining')
    const reset = response.headers.get('X-RateLimit-Reset')
    const limit = response.headers.get('X-RateLimit-Limit')
    
    if (remaining !== null) {
      currentRateLimit.remaining = parseInt(remaining)
      currentRateLimit.reset = parseInt(reset)
      currentRateLimit.limit = parseInt(limit)
    }
    
    if (response.status === 429) {
      console.error(`❌ GitHub API rate limit exceeded for: ${url}`)
      if (reset) {
        const resetTime = new Date(parseInt(reset) * 1000)
        console.log(`🕐 Rate limit resets at: ${resetTime.toLocaleString()}`)
      }
      throw new Error('GitHub API rate limit exceeded. Please try again later.')
    }
    
    if (!response.ok && retryCount < 1) {
      console.log(`⚠️ Request failed (${response.status}), retrying once...`)
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second backoff
      return rateLimitedFetch(url, options, retryCount + 1)
    }
    
    return response
  } catch (error) {
    if (retryCount < 1 && error.message.includes('rate limit')) {
      console.log(`⚠️ Rate limit hit, retrying once...`)
      await new Promise(resolve => setTimeout(resolve, 5000)) // 5 second backoff for rate limits
      return rateLimitedFetch(url, options, retryCount + 1)
    }
    throw error
  }
}

/**
 * Extract owner/repo from a GitHub URL
 * @param {string} githubUrl - Full GitHub URL
 * @returns {string|null} - "owner/repo" format or null if invalid
 */
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

/**
 * Fetch latest releases from a GitHub repository
 * @param {string} repoPath - "owner/repo" format
 * @param {number} limit - Number of releases to fetch (default: 3)
 * @returns {Promise<Array>} - Array of release objects
 */
export const fetchLatestReleases = async (repoPath, limit = 3) => {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/repos/${repoPath}/releases?per_page=${limit}`)
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
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
    console.error(`Error fetching releases for ${repoPath}:`, error)
    return []
  }
}

/**
 * Fetch recent commits from a GitHub repository
 * @param {string} repoPath - "owner/repo" format  
 * @param {number} limit - Number of commits to fetch (default: 5)
 * @returns {Promise<Array>} - Array of commit objects
 */
export const fetchRecentCommits = async (repoPath, limit = 5) => {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/repos/${repoPath}/commits?per_page=${limit}`)
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
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
    console.error(`Error fetching commits for ${repoPath}:`, error)
    return []
  }
}

/**
 * Fetch repository information
 * @param {string} repoPath - "owner/repo" format
 * @returns {Promise<Object|null>} - Repository info object
 */
export const fetchRepositoryInfo = async (repoPath) => {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/repos/${repoPath}`)
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
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
    console.error(`Error fetching repository info for ${repoPath}:`, error)
    return null
  }
}

/**
 * Fetch repositories for an organization
 * @param {string} orgName - Organization name
 * @param {number} limit - Number of repositories to fetch (default: 5)
 * @returns {Promise<Array>} - Array of repository objects
 */
export const fetchOrganizationRepos = async (orgName, limit = 5) => {
  try {
    // Try organization endpoint first
    const response = await rateLimitedFetch(`${GITHUB_API_BASE}/orgs/${orgName}/repos?sort=updated&per_page=${limit}`)
    
    if (!response.ok) {
      // If organization endpoint fails, try searching for repos by organization name
      console.log(`⚠️ Organization endpoint failed for ${orgName}, trying search fallback`)
      const searchResponse = await rateLimitedFetch(`${GITHUB_API_BASE}/search/repositories?q=org:${orgName}&sort=updated&per_page=${limit}`)
      
      if (!searchResponse.ok) {
        throw new Error(`GitHub API error: ${searchResponse.status}`)
      }
      
      const searchResult = await searchResponse.json()
      const repos = searchResult.items || []
      
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
    }
    
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

/**
 * Fetch comprehensive GitHub updates for a resource
 * @param {Object} resource - Resource object with social.github URL
 * @returns {Promise<Object>} - Combined GitHub data
 */
export const fetchGitHubUpdates = async (resource) => {
  const githubUrl = resource.social?.github
  if (!githubUrl) {
    console.log(`❌ No GitHub URL for ${resource.name}`)
    return { releases: [], commits: [], repoInfo: null }
  }
  
  const repoPath = extractRepoPath(githubUrl)
  if (!repoPath) {
    console.log(`❌ Could not extract repo path from ${githubUrl} for ${resource.name}`)
    return { releases: [], commits: [], repoInfo: null }
  }
  
  // Check cache first
  const cacheKey = `${resource.name}-${repoPath}`
  console.log(`🔍 Fetch: Checking cache for ${resource.name} -> ${cacheKey}`)
  const cachedData = githubCache.get(cacheKey)
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log(`📋 Using cached data for ${resource.name}`)
    return cachedData.data
  } else if (cachedData) {
    console.log(`⏰ Cache expired for ${resource.name}, fetching fresh data`)
  } else {
    console.log(`❌ No cache found for ${resource.name}, fetching fresh data`)
  }
  
  console.log(`🔍 Fetching GitHub data for ${resource.name} (${repoPath})`)
  
  try {
    // Check if this is an organization URL (no slash in repoPath)
    if (!repoPath.includes('/')) {
      // This is an organization, fetch repos and get data from the most active ones
      console.log(`🏢 Detected organization: ${repoPath}`)
      const repos = await fetchOrganizationRepos(repoPath, 1) // Only fetch 1 repo to save API calls
      
      if (repos.length === 0) {
        console.log(`❌ No repositories found for organization ${repoPath}`)
        return { releases: [], commits: [], repoInfo: null }
      }
      
      // Get data from the most recently updated repository
      const mostActiveRepo = repos[0] // Already sorted by updated_at
      console.log(`📦 Using most active repo: ${mostActiveRepo.fullName}`)
      
      // Fetch both releases and commits in parallel
      const [releases, commits] = await Promise.all([
        fetchLatestReleases(mostActiveRepo.fullName, 3),
        fetchRecentCommits(mostActiveRepo.fullName, 3)
      ])
      
      const result = {
        releases,
        commits,
        repoInfo: mostActiveRepo,
        lastUpdated: new Date().toISOString()
      }
      
      // Cache the result
      githubCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      // Save to localStorage
      saveCache(Object.fromEntries(githubCache))
      
      console.log(`📊 ${resource.name} (${mostActiveRepo.name}) results:`, {
        releases: result.releases.length,
        commits: result.commits.length,
        repoInfo: mostActiveRepo
      })
      
      return result
    } else {
      // This is a repository URL, fetch directly
      console.log(`📦 Detected repository: ${repoPath}`)
      
      // Fetch both releases and commits in parallel
      const [releases, commits] = await Promise.all([
        fetchLatestReleases(repoPath, 3),
        fetchRecentCommits(repoPath, 3)
      ])
      
      const result = {
        releases,
        commits,
        repoInfo: null, // Skip repo info to save API calls
        lastUpdated: new Date().toISOString()
      }
      
      // Cache the result
      githubCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      // Save to localStorage
      saveCache(Object.fromEntries(githubCache))
      
      console.log(`📊 ${resource.name} results:`, {
        releases: result.releases.length,
        commits: result.commits.length,
        repoInfo: 'skipped'
      })
      
      return result
    }
  } catch (error) {
    console.error(`Error fetching GitHub updates for ${resource.name}:`, error)
    return { releases: [], commits: [], repoInfo: null }
  }
}

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }
  
  return 'Just now'
} 