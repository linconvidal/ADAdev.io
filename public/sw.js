const CACHE_NAME = 'github-updates-v1'
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
const MAX_CACHE_SIZE = 50

// Install event - set up cache
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - handle caching
self.addEventListener('fetch', (event) => {
  // Only handle GitHub API requests
  if (!event.request.url.includes('api.github.com')) {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        if (response) {
          // Check if cache is still valid
          const cacheTime = new Date(response.headers.get('sw-cache-time'))
          const now = new Date()
          
          if (now - cacheTime < CACHE_DURATION) {
            console.log('Serving from cache:', event.request.url)
            return response
          } else {
            console.log('Cache expired, fetching fresh data:', event.request.url)
            cache.delete(event.request)
          }
        }

        // Fetch fresh data
        return fetch(event.request).then((response) => {
          if (response.ok) {
            // Clone response to add cache timestamp
            const responseToCache = response.clone()
            const headers = new Headers(responseToCache.headers)
            headers.append('sw-cache-time', new Date().toISOString())
            
            const cachedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            })

            // Store in cache
            cache.put(event.request, cachedResponse)
            
            // Clean up old entries if cache is too large
            cache.keys().then((requests) => {
              if (requests.length > MAX_CACHE_SIZE) {
                // Remove oldest entries
                const sortedRequests = requests.sort((a, b) => {
                  const aTime = new Date(a.headers.get('sw-cache-time') || 0)
                  const bTime = new Date(b.headers.get('sw-cache-time') || 0)
                  return aTime - bTime
                })
                
                const toDelete = sortedRequests.slice(0, requests.length - MAX_CACHE_SIZE)
                toDelete.forEach((request) => cache.delete(request))
              }
            })
          }
          
          return response
        })
      })
    })
  )
})

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
}) 