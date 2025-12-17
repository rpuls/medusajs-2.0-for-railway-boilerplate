'use client'

import { useState, useEffect } from 'react'
import { Snackbar, Alert, Button, Box, Typography } from '@mui/material'
import { Notifications, Close } from '@mui/icons-material'
import { useTranslation } from '@lib/i18n/hooks/use-translation'
import {
  subscribeToPushNotifications,
  isSubscribedToPushNotifications,
  requestNotificationPermission,
} from '@lib/pwa/push-subscription'

const STORAGE_KEY = 'pwa-notification-banner-dismissed'

export function NotificationPermissionBanner() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const subscribed = await isSubscribedToPushNotifications()
      setIsSubscribed(subscribed)

      if (!subscribed) {
        // Check if banner was dismissed
        const dismissed = localStorage.getItem(STORAGE_KEY)
        if (!dismissed) {
          // Check permission status
          if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = Notification.permission
            if (permission === 'default') {
              setOpen(true)
            }
          }
        }
      }
    } catch (error) {
      console.error('[PWA] Failed to check subscription status:', error)
    }
  }

  const handleEnable = async () => {
    setIsLoading(true)
    try {
      await subscribeToPushNotifications()
      setIsSubscribed(true)
      setOpen(false)
      localStorage.removeItem(STORAGE_KEY) // Reset dismissal
    } catch (error) {
      console.error('[PWA] Failed to enable notifications:', error)
      // Permission might be denied, hide banner
      if (error instanceof Error && error.message.includes('denied')) {
        handleDismiss()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setOpen(false)
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  // Don't show if already subscribed or if notifications aren't supported
  if (isSubscribed || typeof window === 'undefined' || !('Notification' in window)) {
    return null
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 16, sm: 24 } }}
    >
      <Alert
        severity="info"
        icon={<Notifications />}
        action={
          <Box display="flex" gap={1} alignItems="center">
            <Button
              color="inherit"
              size="small"
              onClick={handleEnable}
              disabled={isLoading}
              sx={{ textTransform: 'none' }}
            >
              {isLoading ? t('common.loading') : t('common.enable')}
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
          {t('pwa.notifications.enableTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('pwa.notifications.enableDescription')}
        </Typography>
      </Alert>
    </Snackbar>
  )
}

