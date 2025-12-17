'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@lib/pwa/service-worker-registration'
import { NotificationPermissionBanner } from '@modules/common/components/notification-permission-banner'
import { PWAInstallPrompt } from '@modules/common/components/pwa-install-prompt'

export function PWAComponents() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker({
      onUpdate: (registration) => {
        console.log('[PWA] Service worker update available')
        // Optionally show update notification to user
        if (window.confirm('New version available. Reload to update?')) {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      },
      onSuccess: () => {
        console.log('[PWA] Service worker registered successfully')
      },
      onError: (error) => {
        console.error('[PWA] Service worker registration error:', error)
      },
    })
  }, [])

  return (
    <>
      <NotificationPermissionBanner />
      <PWAInstallPrompt />
    </>
  )
}

