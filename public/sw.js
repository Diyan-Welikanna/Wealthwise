/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'wealthwise-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/income',
  '/expenses',
  '/budget',
  '/recurring',
  '/investment',
  '/goals',
  '/profile',
  '/auth/signin',
]

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch Strategy: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone()
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        
        return response
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
      })
  )
})

// Push Notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'WealthWise', options)
  )
})

// Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    const url = event.notification.data.url || '/dashboard'
    event.waitUntil(
      clients.openWindow(url)
    )
  }
})

// Background Sync (for offline expense submission)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses())
  }
})

async function syncExpenses() {
  try {
    const cache = await caches.open('offline-expenses')
    const requests = await cache.keys()
    
    for (const request of requests) {
      const response = await cache.match(request)
      const data = await response?.json()
      
      // Retry sending to server
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      // Remove from offline cache after successful sync
      await cache.delete(request)
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}
