import { loadEnv, defineConfig } from '@medusajs/utils'

loadEnv(process.env.NODE_ENV, process.cwd())

const plugins = [
  'medusa-fulfillment-manual'
]

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  http: {
    adminCors: process.env.ADMIN_CORS,
    authCors: process.env.AUTH_CORS,
    storeCors: process.env.STORE_CORS,
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
  },
  redis_url: process.env.REDIS_URL,
  database_url: process.env.DATABASE_URL,
  database_type: 'postgres',
};

export default defineConfig({
  projectConfig,
  plugins,
  modules: {},
  admin: {
    path: '/dashboard',
    backendUrl: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE,
  }
});
