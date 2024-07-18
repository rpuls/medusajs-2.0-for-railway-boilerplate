import { loadEnv, defineConfig } from '@medusajs/utils'

loadEnv(process.env.NODE_ENV, process.cwd())

const ADMIN_APP_PORT = process.env.PORT || 7001;
const ADMIN_CORS = process.env.ADMIN_CORS || 'http://localhost:7000,http://localhost:7001'
const STORE_CORS = process.env.STORE_CORS || 'http://localhost:8000'

const plugins = [
  'medusa-fulfillment-manual',
  {
    resolve: '@medusajs/admin',
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      develop: {
        open: process.env.OPEN_BROWSER !== 'false',
        port: ADMIN_APP_PORT,
      },
    },
  }
]

export default defineConfig({
  projectConfig: {
    redis_url: process.env.REDIS_URL,
    database_url: process.env.DATABASE_URL,
    database_type: 'postgres',
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    auth_cors: process.env.AUTH_CORS,
  },
  plugins,
  modules: {},
  featureFlags: {
    medusa_v2: true
  },
})