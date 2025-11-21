import inject from "@medusajs/admin-vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import inspect from "vite-plugin-inspect"
import path from "path"
import fs from "fs"

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
   * Load admin extensions from the backend in this monorepo.
   * The admin-vite-plugin crawls ${source}/routes for route files (page.tsx)
   * and generates menu items from route configs automatically.
   * 
   * Routes should be in: backend-ui/routes/
   * Menu items are auto-generated from route configs (defineRouteConfig)
   * 
   * __dirname is the directory where this config file is located (backend-ui)
   */
  const backendUiDir = __dirname
  const MEDUSA_PROJECT = env.VITE_MEDUSA_PROJECT || path.resolve(backendUiDir, '../backend')
  // Use backend-ui as the source since we've symlinked the admin files here
  const sources = [backendUiDir]
  
  // Log for debugging (will show in Railway build logs and dev server)
  const resolvedPath = MEDUSA_PROJECT ? path.resolve(MEDUSA_PROJECT) : null
  const localRoutesExists = fs.existsSync(path.join(backendUiDir, 'routes'))
  const symlinkedRoutesExists = fs.existsSync(path.join(backendUiDir, 'routes', 'custom', 'xml-importer'))
  
  console.error('🔧 Admin extensions source:', {
    MEDUSA_PROJECT,
    sources,
    backendUiDir,
    currentDir: process.cwd(),
    localRoutesExists,
    symlinkedRoutesExists,
    resolvedPath
  })

  return {
    base: BASE,
    plugins: [
      inspect(),
      react(),
      inject({
        sources,
      }),
    ],
    resolve: {
      alias: resolvedPath ? {
        // Alias the backend admin directory so the plugin can find it
        '@backend-admin': path.join(resolvedPath, 'src', 'admin'),
      } : {},
    },
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
