/**
 * Push Subscription Management
 * Handles Web Push API subscription, storage, and management
 */

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface DeviceInfo {
  type?: string
  browser?: string
  os?: string
  model?: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ''

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser')
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    throw new Error('Notification permission was previously denied')
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Get VAPID public key from backend
 */
export async function getVapidPublicKey(): Promise<string> {
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured. Please set NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable.')
  }

  try {
    const response = await fetch(`${BACKEND_URL}/store/push/public-key`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get VAPID public key')
    }

    const data = await response.json()
    return data.publicKey
  } catch (error) {
    console.error('[PWA] Failed to get VAPID public key:', error)
    throw error
  }
}

/**
 * Convert base64 URL to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  deviceInfo?: DeviceInfo
): Promise<PushSubscriptionData | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported')
  }

  if (!('PushManager' in window)) {
    throw new Error('Push notifications are not supported')
  }

  // Request permission
  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission denied')
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready

  // Get VAPID public key
  const vapidPublicKey = await getVapidPublicKey()
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

  // Subscribe to push
  let subscription: PushSubscription | null = null
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
  } catch (error) {
    console.error('[PWA] Failed to subscribe to push:', error)
    throw error
  }

  // Convert subscription to our format
  const subscriptionData: PushSubscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
      auth: arrayBufferToBase64(subscription.getKey('auth')!),
    },
  }

  // Store subscription in backend
  try {
    await storePushSubscription(subscriptionData, deviceInfo)
  } catch (error) {
    console.error('[PWA] Failed to store push subscription:', error)
    // Don't throw - subscription is still valid locally
  }

  return subscriptionData
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      return true // Already unsubscribed
    }

    const unsubscribed = await subscription.unsubscribe()

    if (unsubscribed) {
      // Remove subscription from backend
      await removePushSubscription(subscription.endpoint)
    }

    return unsubscribed
  } catch (error) {
    console.error('[PWA] Failed to unsubscribe from push:', error)
    return false
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    console.error('[PWA] Failed to check subscription status:', error)
    return false
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscriptionData | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      return null
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    }
  } catch (error) {
    console.error('[PWA] Failed to get push subscription:', error)
    return null
  }
}

/**
 * Store push subscription in backend
 */
async function storePushSubscription(
  subscription: PushSubscriptionData,
  deviceInfo?: DeviceInfo
): Promise<void> {
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured. Please set NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable.')
  }

  const response = await fetch(`${BACKEND_URL}/store/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
    body: JSON.stringify({
      subscription,
      device_info: deviceInfo || getDefaultDeviceInfo(),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to store subscription' }))
    throw new Error(error.message || 'Failed to store push subscription')
  }
}

/**
 * Remove push subscription from backend
 */
async function removePushSubscription(endpoint: string): Promise<void> {
  if (!BACKEND_URL) {
    console.warn('[PWA] Backend URL not configured, skipping unsubscribe')
    return
  }

  const response = await fetch(`${BACKEND_URL}/store/push/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ endpoint }),
  })

  if (!response.ok) {
    console.warn('[PWA] Failed to remove push subscription from backend')
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * Get default device info
 */
function getDefaultDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {}
  }

  const ua = navigator.userAgent
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)

  let browser = 'Unknown'
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  let os = 'Unknown'
  if (isIOS) os = 'iOS'
  else if (isAndroid) os = 'Android'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'

  return {
    type: isMobile ? 'mobile' : 'desktop',
    browser,
    os,
  }
}

