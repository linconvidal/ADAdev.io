// Server-side rate limiting and spam protection
class RateLimiter {
  constructor() {
    this.ipRequests = new Map()
    this.blockedIPs = new Set()
    this.suspiciousIPs = new Map()
  }

  // Track requests by IP
  trackRequest(ip, endpoint) {
    const now = Date.now()
    const key = `${ip}:${endpoint}`
    
    if (!this.ipRequests.has(key)) {
      this.ipRequests.set(key, [])
    }
    
    const requests = this.ipRequests.get(key)
    requests.push(now)
    
    // Keep only requests from last 5 minutes
    const fiveMinutesAgo = now - 5 * 60 * 1000
    const recentRequests = requests.filter(time => time > fiveMinutesAgo)
    this.ipRequests.set(key, recentRequests)
    
    return recentRequests.length
  }

  // Check if IP is blocked
  isBlocked(ip) {
    return this.blockedIPs.has(ip)
  }

  // Check rate limits
  checkRateLimit(ip, endpoint) {
    if (this.isBlocked(ip)) {
      throw new Error('Access denied')
    }

    const requestCount = this.trackRequest(ip, endpoint)
    
    // Block if too many requests
    if (requestCount > 20) { // 20 requests per 5 minutes
      this.blockedIPs.add(ip)
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    
    // Mark as suspicious if high activity
    if (requestCount > 10) {
      this.suspiciousIPs.set(ip, (this.suspiciousIPs.get(ip) || 0) + 1)
    }
    
    // Block if consistently suspicious
    if (this.suspiciousIPs.get(ip) > 3) {
      this.blockedIPs.add(ip)
      throw new Error('Suspicious activity detected. Access denied.')
    }
  }

  // Clean up old data
  cleanup() {
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000
    
    for (const [key, requests] of this.ipRequests.entries()) {
      const recentRequests = requests.filter(time => time > fiveMinutesAgo)
      if (recentRequests.length === 0) {
        this.ipRequests.delete(key)
      } else {
        this.ipRequests.set(key, recentRequests)
      }
    }
  }
}

// Content validation
export const validateContent = (content) => {
  const issues = []
  
  // Check for spam patterns
  const spamPatterns = [
    /\b(buy|sell|cheap|discount|offer|limited|act now|click here)\b/gi,
    /(.)\1{5,}/g, // Repeated characters
    /\b(spam|viagra|casino|poker)\b/gi,
  ]
  
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      issues.push('Content contains suspicious patterns')
      break
    }
  }
  
  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/)
  const wordCount = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  const maxRepetition = Math.max(...Object.values(wordCount))
  if (maxRepetition > words.length * 0.3) {
    issues.push('Content contains excessive repetition')
  }
  
  // Check for suspicious length patterns
  if (content.length < 10 || content.length > 2000) {
    issues.push('Content length is outside acceptable range')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

// Get client IP (for server-side use)
export const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip
}

export const rateLimiter = new RateLimiter()

// Cleanup old data every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000) 