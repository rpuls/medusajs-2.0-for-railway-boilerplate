// Service Worker for PWA - Aggressive Caching Strategy
// Version: 2.0.0
const CACHE_VERSION = 'v2'
const STATIC_CACHE = `ms-store-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `ms-store-dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `ms-store-images-${CACHE_VERSION}`
const API_CACHE = `ms-store-api-${CACHE_VERSION}`

// Maximum cache sizes (in items)
const MAX_IMAGE_CACHE_SIZE = 100
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_API_CACHE_SIZE = 30

// Cache duration (in seconds)
const CACHE_DURATION = {
  static: 365 * 24 * 60 * 60, // 1 year for static assets
  images: 30 * 24 * 60 * 60,  // 30 days for images
  api: 5 * 60,                 // 5 minutes for API responses
  pages: 24 * 60 * 60,         // 24 hours for HTML pages
}

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v2.0.0...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[Service Worker] Failed to cache static assets:', err)
        return Promise.resolve()
      })
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v2.0.0...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete all caches that don't match current version
            return name.startsWith('ms-store-') && !name.endsWith(CACHE_VERSION)
          })
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      console.log('[Service Worker] Activated v2.0.0')
      return self.clients.claim()
    })
  )
})

// Fetch event - implement aggressive caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // === DO NOT CACHE (Always Network) ===
  // Cart, Checkout, Account (dynamic data)
  if (
    url.pathname.includes('/cart') ||
    url.pathname.includes('/checkout') ||
    url.pathname.includes('/account') ||
    // Backend API calls for cart, checkout, prices, inventory
    url.pathname.includes('/store/cart') ||
    url.pathname.includes('/store/checkout') ||
    url.pathname.includes('/store/payment') ||
    url.pathname.includes('/store/customer') ||
    // Price and availability endpoints (always fetch fresh)
    url.searchParams.has('fields') && url.searchParams.get('fields')?.includes('price') ||
    url.searchParams.has('fields') && url.searchParams.get('fields')?.includes('inventory')
  ) {
    event.respondWith(networkOnly(request))
    return
  }

  // === CACHE FIRST (Static Assets) ===
  // JS, CSS, Fonts, Icons - cache aggressively, they have hashes in filenames
  if (
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|otf)$/) ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/data/')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // === CACHE FIRST (Images) ===
  // Images - cache aggressively with separate cache
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/) ||
    url.pathname.startsWith('/_next/image/')
  ) {
    event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE, CACHE_DURATION.images, MAX_IMAGE_CACHE_SIZE))
    return
  }

  // === STALE WHILE REVALIDATE (API Calls - Cacheable) ===
  // Product listings, categories, collections (cache but always update in background)
  if (
    url.pathname.includes('/store/products') ||
    url.pathname.includes('/store/categories') ||
    url.pathname.includes('/store/collections') ||
    url.pathname.includes('/store/regions')
  ) {
    event.respondWith(staleWhileRevalidateWithExpiry(request, API_CACHE, CACHE_DURATION.api, MAX_API_CACHE_SIZE))
    return
  }

  // === STALE WHILE REVALIDATE (HTML Pages) ===
  // All HTML pages - cache aggressively, show cached version instantly while updating
  if (
    request.headers.get('accept')?.includes('text/html') ||
    url.pathname === '/' ||
    url.pathname.match(/^\/[a-z]{2}\//) // Country code routes
  ) {
    event.respondWith(staleWhileRevalidateWithExpiry(request, DYNAMIC_CACHE, CACHE_DURATION.pages, MAX_DYNAMIC_CACHE_SIZE))
    return
  }

  // === NETWORK FIRST (Other API Calls) ===
  // Everything else - try network first, fallback to cache
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE))
})

// Network Only - Don't cache at all
async function networkOnly(request) {
  try {
    return await fetch(request)
  } catch (error) {
    return new Response('Network request failed', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

// Cache First - Return from cache, update in background
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[Service Worker] Cache First failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Cache First with Expiry - Cache with expiration check
async function cacheFirstWithExpiry(request, cacheName, maxAge, maxItems) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'))
    const now = new Date()
    
    if (now - cachedDate < maxAge * 1000) {
      return cachedResponse
    }
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone()
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cached-date', new Date().toISOString())
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      })
      
      cache.put(request, cachedResponse)
      
      // Limit cache size
      limitCacheSize(cacheName, maxItems)
    }
    return networkResponse
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Offline', { status: 503 })
  }
}

// Stale While Revalidate with Expiry - Return cached immediately, update in background
async function staleWhileRevalidateWithExpiry(request, cacheName, maxAge, maxItems) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone()
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cached-date', new Date().toISOString())
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      })
      
      cache.put(request, cachedResponse)
      
      // Limit cache size
      limitCacheSize(cacheName, maxItems)
    }
    return networkResponse
  }).catch(() => {
    return cachedResponse || new Response('Offline', { status: 503 })
  })

  return cachedResponse || fetchPromise
}

// Network First with Cache Fallback
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Offline', { status: 503 })
  }
}

// Limit cache size to prevent storage issues
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxItems) {
    // Remove oldest items (first in the keys array)
    const itemsToDelete = keys.length - maxItems
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i])
    }
  }
}

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received')
  
  if (!event.data) {
    return
  }

  let data = {}
  try {
    data = event.data.json()
  } catch (e) {
    data = {
      title: 'MS Store',
      body: event.data.text() || 'You have a new notification',
    }
  }

  const options = {
    title: data.title || 'MS Store',
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    image: data.image,
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [200, 100, 200],
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  )
})

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked')
  
  event.notification.close()

  const data = event.notification.data || {}
  const url = data.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag)
  
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart())
  }
})

async function syncCart() {
  console.log('[Service Worker] Syncing cart...')
  // Cart sync would go here
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        )
      })
    )
  }
})
