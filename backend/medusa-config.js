import { loadEnv, defineConfig } from '@medusajs/utils'

const isDev = process.env.NODE_ENV === 'development';

loadEnv(process.env.NODE_ENV, process.cwd())

const plugins = [
  'medusa-fulfillment-manual'
]

console.log(process.env.ADMIN_CORS); 

console.log(process.env.ADMIN_CORS?.trim());


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

const completeConfig = {
  projectConfig,
  plugins,
  modules: {},
  admin: {
    ...!isDev && { backendUrl: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE },
  }
};

console.log(completeConfig);

console.log('adminCors:', projectConfig.http.adminCors);
console.log('authCors:', projectConfig.http.authCors);
console.log('storeCors:', projectConfig.http.storeCors);
console.log('backendUrl:', completeConfig.admin.backendUrl);

const backendurlvar = process.env.RAILWAY_PUBLIC_DOMAIN_VALUE;
const minimalConfig = {
  adminCors: process.env.ADMIN_CORS,
  authCors: process.env.AUTH_CORS,
  storeCors: process.env.STORE_CORS,
  backendUrl: backendurlvar
};

console.log(minimalConfig);
console.log(JSON.stringify(minimalConfig, null, 2));


export default defineConfig(completeConfig);
