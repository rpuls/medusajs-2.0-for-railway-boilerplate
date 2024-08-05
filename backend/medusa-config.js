import { loadEnv, Modules, defineConfig } from '@medusajs/utils'

const isDev = process.env.NODE_ENV === 'development';

loadEnv(process.env.NODE_ENV, process.cwd())

const plugins = [
  // 'medusa-fulfillment-manual'
];

const modules = {};

// Stripe payment provider
const stripeApiKey = process.env.STRIPE_API_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeConfigured = stripeApiKey && stripeWebhookSecret;
if (stripeConfigured) {
  modules[Modules.PAYMENT] = {
    resolve: '@medusajs/payment',
    options: {
      providers: [
        {
          resolve: '@medusajs/payment-stripe',
          id: 'stripe',
          options: {
            apiKey: stripeApiKey,
            webhookSecret: stripeWebhookSecret
          }
        }
      ]
    }
  };
}

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
  modules,
  admin: {
    ...!isDev && { backendUrl: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE },
  }
};

export default defineConfig(completeConfig);
