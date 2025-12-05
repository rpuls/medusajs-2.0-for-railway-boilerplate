'use client'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../lib/theme/mui-theme'

/**
 * Material UI Providers for Next.js App Router
 * 
 * This component wraps the app with MUI providers:
 * - AppRouterCacheProvider: Handles Emotion cache for SSR
 * - ThemeProvider: Provides MUI theme
 * - CssBaseline: Normalizes CSS across browsers
 */
export function MuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

