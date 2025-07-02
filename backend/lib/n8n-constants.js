// N8N Integration Constants
export const N8N_CONFIG = {
  WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || 'https://n8n-automation-production-6e02.up.railway.app',
  WEBHOOK_SECRET: process.env.MEDUSA_WEBHOOK_SECRET || 'medusa_webhook_volaron_2025',
  BACKEND_URL: process.env.MEDUSA_BACKEND_URL || 'https://backend-production-c461d.up.railway.app',
  
  // Webhook endpoints
  WEBHOOKS: {
    ORDER_CREATED: '/webhook/medusa/order-created',
    PRODUCT_UPDATED: '/webhook/medusa/product-updated',
    CUSTOMER_CREATED: '/webhook/medusa/customer-created',
    INVENTORY_LEVEL_UPDATED: '/webhook/medusa/inventory-updated',
    PAYMENT_FAILED: '/webhook/medusa/payment-failed',
  }
}

// Event types to listen for
export const MEDUSA_EVENTS = [
  'order.placed',
  'order.updated',
  'order.payment_captured',
  'order.canceled',
  'product.created',
  'product.updated',
  'product.deleted',
  'customer.created',
  'customer.updated',
  'inventory.item_created',
  'inventory.item_updated',
  'payment.payment_failed',
  'cart.updated',
]

// Legacy exports for compatibility
export const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n-automation-production-6e02.up.railway.app";
export const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || "medusa_webhook_volaron_2025";
export const N8N_API_KEY = process.env.N8N_API_KEY || "";
export const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://ollama.railway.internal:11434";
export const AI_MODEL = process.env.AI_MODEL || "llama3.1";
export const ENABLE_AI_FEATURES = process.env.ENABLE_AI_FEATURES === "true";