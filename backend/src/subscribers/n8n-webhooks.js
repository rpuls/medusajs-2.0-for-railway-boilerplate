import axios from "axios";

class N8nWebhookSubscriber {
  constructor({
    eventBusService,
    orderService,
    productService,
    customerService,
    cartService,
    inventoryService,
  }) {
    this.eventBus_ = eventBusService;
    this.orderService_ = orderService;
    this.productService_ = productService;
    this.customerService_ = customerService;
    this.cartService_ = cartService;
    this.inventoryService_ = inventoryService;

    // URLs dos webhooks N8N
    this.n8nBaseUrl = process.env.N8N_WEBHOOK_URL || "https://n8n-automation-production-6e02.up.railway.app";
    this.webhookSecret = process.env.N8N_WEBHOOK_SECRET || "medusa_webhook_volaron_2025";

    // Registrar todos os eventos
    this.registerEventHandlers();
  }

  registerEventHandlers() {
    // Eventos de Pedidos
    this.eventBus_.subscribe("order.placed", this.handleOrderPlaced.bind(this));
    this.eventBus_.subscribe("order.updated", this.handleOrderUpdated.bind(this));
    this.eventBus_.subscribe("order.canceled", this.handleOrderCanceled.bind(this));
    this.eventBus_.subscribe("order.completed", this.handleOrderCompleted.bind(this));
    this.eventBus_.subscribe("order.refund_created", this.handleOrderRefund.bind(this));
    this.eventBus_.subscribe("order.fulfillment_created", this.handleFulfillmentCreated.bind(this));
    this.eventBus_.subscribe("order.shipment_created", this.handleShipmentCreated.bind(this));
    this.eventBus_.subscribe("order.return_requested", this.handleReturnRequested.bind(this));

    // Eventos de Produtos
    this.eventBus_.subscribe("product.created", this.handleProductCreated.bind(this));
    this.eventBus_.subscribe("product.updated", this.handleProductUpdated.bind(this));
    this.eventBus_.subscribe("product.deleted", this.handleProductDeleted.bind(this));
    this.eventBus_.subscribe("product-variant.created", this.handleVariantCreated.bind(this));
    this.eventBus_.subscribe("product-variant.updated", this.handleVariantUpdated.bind(this));

    // Eventos de Clientes
    this.eventBus_.subscribe("customer.created", this.handleCustomerCreated.bind(this));
    this.eventBus_.subscribe("customer.updated", this.handleCustomerUpdated.bind(this));
    this.eventBus_.subscribe("customer.password_reset", this.handlePasswordReset.bind(this));

    // Eventos de Carrinho
    this.eventBus_.subscribe("cart.created", this.handleCartCreated.bind(this));
    this.eventBus_.subscribe("cart.updated", this.handleCartUpdated.bind(this));
    this.eventBus_.subscribe("cart.customer_updated", this.handleCartCustomerUpdated.bind(this));

    // Eventos de Estoque
    this.eventBus_.subscribe("inventory.item.created", this.handleInventoryCreated.bind(this));
    this.eventBus_.subscribe("inventory.item.updated", this.handleInventoryUpdated.bind(this));
    this.eventBus_.subscribe("inventory.item.deleted", this.handleInventoryDeleted.bind(this));

    // Eventos de Pagamento
    this.eventBus_.subscribe("payment.payment_collection_created", this.handlePaymentCreated.bind(this));
    this.eventBus_.subscribe("payment.captured", this.handlePaymentCaptured.bind(this));
    this.eventBus_.subscribe("payment.capture_failed", this.handlePaymentFailed.bind(this));
  }

  async sendWebhook(endpoint, data, retries = 3) {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      secret: this.webhookSecret,
    };

    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(
          `${this.n8nBaseUrl}/webhook/${endpoint}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': this.webhookSecret,
              'X-Medusa-Event': endpoint,
            },
            timeout: 10000, // 10 segundos timeout
          }
        );
        
        console.log(`✅ Webhook sent successfully to ${endpoint}:`, response.status);
        return response;
      } catch (error) {
        console.error(`❌ Failed to send webhook to ${endpoint} (attempt ${i + 1}/${retries}):`, error.message);
        
        if (i === retries - 1) {
          // Log final failure but don't throw to avoid blocking the process
          console.error(`Failed to send webhook after ${retries} attempts:`, {
            endpoint,
            error: error.message,
            data: error.response?.data,
          });
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
  }

  // Handlers de Pedidos
  async handleOrderPlaced({ id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["items", "items.variant", "items.variant.product", "customer", "shipping_address", "billing_address", "region", "payments"],
      });
      await this.sendWebhook("order-placed", { order });
    } catch (error) {
      console.error("Error in handleOrderPlaced:", error);
    }
  }

  async handleOrderUpdated({ id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["items", "customer", "fulfillments"],
      });
      await this.sendWebhook("order-updated", { order });
    } catch (error) {
      console.error("Error in handleOrderUpdated:", error);
    }
  }

  async handleOrderCanceled({ id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["items", "customer"],
      });
      await this.sendWebhook("order-canceled", { order });
    } catch (error) {
      console.error("Error in handleOrderCanceled:", error);
    }
  }

  async handleOrderCompleted({ id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["items", "customer", "fulfillments"],
      });
      await this.sendWebhook("order-completed", { order });
    } catch (error) {
      console.error("Error in handleOrderCompleted:", error);
    }
  }

  async handleOrderRefund({ id, refund_id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["refunds", "customer"],
      });
      await this.sendWebhook("order-refund-created", { order, refund_id });
    } catch (error) {
      console.error("Error in handleOrderRefund:", error);
    }
  }

  async handleFulfillmentCreated({ id, fulfillment_id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["fulfillments", "customer"],
      });
      await this.sendWebhook("fulfillment-created", { order, fulfillment_id });
    } catch (error) {
      console.error("Error in handleFulfillmentCreated:", error);
    }
  }

  async handleShipmentCreated({ id, fulfillment_id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["fulfillments", "customer"],
      });
      await this.sendWebhook("shipment-created", { order, fulfillment_id });
    } catch (error) {
      console.error("Error in handleShipmentCreated:", error);
    }
  }

  async handleReturnRequested({ id, return_id }) {
    try {
      const order = await this.orderService_.retrieve(id, {
        relations: ["returns", "customer"],
      });
      await this.sendWebhook("return-requested", { order, return_id });
    } catch (error) {
      console.error("Error in handleReturnRequested:", error);
    }
  }

  // Handlers de Produtos
  async handleProductCreated({ id }) {
    try {
      const product = await this.productService_.retrieve(id, {
        relations: ["variants", "images", "tags", "type", "collection"],
      });
      await this.sendWebhook("product-created", { product });
    } catch (error) {
      console.error("Error in handleProductCreated:", error);
    }
  }

  async handleProductUpdated({ id, fields }) {
    try {
      const product = await this.productService_.retrieve(id, {
        relations: ["variants", "images", "tags"],
      });
      await this.sendWebhook("product-updated", { product, updated_fields: fields });
    } catch (error) {
      console.error("Error in handleProductUpdated:", error);
    }
  }

  async handleProductDeleted({ id }) {
    await this.sendWebhook("product-deleted", { productId: id });
  }

  async handleVariantCreated({ id, product_id }) {
    try {
      const product = await this.productService_.retrieve(product_id, {
        relations: ["variants"],
      });
      await this.sendWebhook("variant-created", { product, variant_id: id });
    } catch (error) {
      console.error("Error in handleVariantCreated:", error);
    }
  }

  async handleVariantUpdated({ id, product_id, fields }) {
    try {
      const product = await this.productService_.retrieve(product_id, {
        relations: ["variants"],
      });
      await this.sendWebhook("variant-updated", { product, variant_id: id, updated_fields: fields });
    } catch (error) {
      console.error("Error in handleVariantUpdated:", error);
    }
  }

  // Handlers de Clientes
  async handleCustomerCreated({ id }) {
    try {
      const customer = await this.customerService_.retrieve(id, {
        relations: ["shipping_addresses", "groups"],
      });
      await this.sendWebhook("customer-created", { customer });
    } catch (error) {
      console.error("Error in handleCustomerCreated:", error);
    }
  }

  async handleCustomerUpdated({ id, fields }) {
    try {
      const customer = await this.customerService_.retrieve(id);
      await this.sendWebhook("customer-updated", { customer, updated_fields: fields });
    } catch (error) {
      console.error("Error in handleCustomerUpdated:", error);
    }
  }

  async handlePasswordReset({ id, token }) {
    try {
      const customer = await this.customerService_.retrieve(id);
      await this.sendWebhook("password-reset-requested", { 
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
        }
      });
    } catch (error) {
      console.error("Error in handlePasswordReset:", error);
    }
  }

  // Handlers de Carrinho
  async handleCartCreated({ id }) {
    try {
      const cart = await this.cartService_.retrieve(id, {
        relations: ["items", "region", "customer"],
      });
      await this.sendWebhook("cart-created", { cart });
    } catch (error) {
      console.error("Error in handleCartCreated:", error);
    }
  }

  async handleCartUpdated({ id }) {
    try {
      const cart = await this.cartService_.retrieve(id, {
        relations: ["items", "customer"],
      });
      await this.sendWebhook("cart-updated", { cart });
    } catch (error) {
      console.error("Error in handleCartUpdated:", error);
    }
  }

  async handleCartCustomerUpdated({ id }) {
    try {
      const cart = await this.cartService_.retrieve(id, {
        relations: ["items", "customer"],
      });
      await this.sendWebhook("cart-customer-updated", { cart });
    } catch (error) {
      console.error("Error in handleCartCustomerUpdated:", error);
    }
  }

  // Handlers de Estoque
  async handleInventoryCreated({ id }) {
    await this.sendWebhook("inventory-created", { inventoryItemId: id });
  }

  async handleInventoryUpdated({ id, fields }) {
    await this.sendWebhook("inventory-updated", { 
      inventoryItemId: id,
      updated_fields: fields 
    });
  }

  async handleInventoryDeleted({ id }) {
    await this.sendWebhook("inventory-deleted", { inventoryItemId: id });
  }

  // Handlers de Pagamento
  async handlePaymentCreated({ id }) {
    await this.sendWebhook("payment-created", { paymentCollectionId: id });
  }

  async handlePaymentCaptured({ id, payment_id }) {
    await this.sendWebhook("payment-captured", { 
      paymentCollectionId: id,
      paymentId: payment_id 
    });
  }

  async handlePaymentFailed({ id, payment_id, error }) {
    await this.sendWebhook("payment-failed", { 
      paymentCollectionId: id,
      paymentId: payment_id,
      error: error 
    });
  }
}

export default N8nWebhookSubscriber;