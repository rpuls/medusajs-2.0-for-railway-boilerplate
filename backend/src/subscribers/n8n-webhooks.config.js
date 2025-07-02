// N8n webhook subscriber configuration
export default {
  // Identifier for the subscriber
  name: "n8n-webhook-subscriber",
  
  // Services this subscriber depends on
  dependencies: [
    "eventBusService",
    "orderService", 
    "productService",
    "customerService",
    "cartService",
    "inventoryService"
  ],

  // Configuration for the subscriber
  config: {
    enabled: true,
    webhookUrl: process.env.N8N_WEBHOOK_URL || "https://n8n-automation-production-6e02.up.railway.app",
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || "medusa_webhook_volaron_2025",
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 30000,
    
    // Events to subscribe to
    events: [
      // Order events
      "order.placed",
      "order.updated", 
      "order.canceled",
      "order.completed",
      "order.refund_created",
      "order.fulfillment_created",
      "order.shipment_created",
      "order.return_requested",
      
      // Product events
      "product.created",
      "product.updated",
      "product.deleted",
      "product-variant.created",
      "product-variant.updated",
      
      // Customer events
      "customer.created",
      "customer.updated",
      "customer.password_reset",
      
      // Cart events
      "cart.created",
      "cart.updated",
      
      // Payment events
      "payment.captured",
      "payment.capture_failed",
      "payment.refund_created",
      
      // Inventory events
      "inventory.item_created",
      "inventory.item_updated",
      "inventory.item_deleted"
    ]
  }
}