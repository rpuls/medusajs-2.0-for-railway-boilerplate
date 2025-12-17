'use client'

import { useState, useEffect } from 'react'
import { Button, Snackbar, Alert, Box, Typography } from '@mui/material'
import { GetApp, Close } from '@mui/icons-material'
import { useTranslation } from '@lib/i18n/hooks/use-translation'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'pwa-install-prompt-dismissed'

export function PWAInstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
        localStorage.removeItem(STORAGE_KEY)
      } else {
        handleDismiss()
      }
    } catch (error) {
      console.error('[PWA] Failed to show install prompt:', error)
    } finally {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 16, sm: 24 } }}
    >
      <Alert
        severity="info"
        icon={<GetApp />}
        action={
          <Box display="flex" gap={1} alignItems="center">
            <Button
              color="inherit"
              size="small"
              onClick={handleInstall}
              startIcon={<GetApp />}
              sx={{ textTransform: 'none' }}
            >
              {t('pwa.install.installButton')}
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleDismiss}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <Close fontSize="small" />
            </Button>
          </Box>
        }
        sx={{
          minWidth: { xs: '90%', sm: '400px' },
          maxWidth: { xs: '90%', sm: '500px' },
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="body2" fontWeight={500} mb={0.5}>
          {t('pwa.install.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('pwa.install.description')}
        </Typography>
      </Alert>
    </Snackbar>
  )
}

