import inject from "@medusajs/admin-vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import inspect from "vite-plugin-inspect"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars - Railway sets them in process.env, loadEnv reads from .env files
  // Merge both sources, prioritizing process.env (Railway) over .env files
  const envFileVars = loadEnv(mode, process.cwd())
  const env = {
    ...envFileVars,
    ...process.env  // process.env takes precedence (Railway env vars)
  }

  const BASE = env.VITE_MEDUSA_BASE || "/"
  const BACKEND_URL = env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const STOREFRONT_URL =
    env.VITE_MEDUSA_STOREFRONT_URL || "http://localhost:8000"

  // Log for debugging (will show in Railway build logs)
  console.error('🔧 Vite build config:', {
    mode,
    BACKEND_URL,
    STOREFRONT_URL,
    hasBackendUrl: !!env.VITE_MEDUSA_BACKEND_URL,
    fromProcessEnv: !!process.env.VITE_MEDUSA_BACKEND_URL,
    fromEnvFile: !!envFileVars.VITE_MEDUSA_BACKEND_URL
  })

  /**
   * Add this to your .env file to specify the project to load admin extensions from.
   */
  const MEDUSA_PROJECT = env.VITE_MEDUSA_PROJECT || null
  const sources = MEDUSA_PROJECT ? [MEDUSA_PROJECT] : []

  return {
    base: BASE,
    plugins: [
      inspect(),
      react(),
      inject({
        sources,
      }),
    ],
    define: {
      __BASE__: JSON.stringify(BASE),
      __BACKEND_URL__: JSON.stringify(BACKEND_URL),
      __STOREFRONT_URL__: JSON.stringify(STOREFRONT_URL),
    },
    server: {
      open: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
