import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// Define a simple Workflow class since we can't import it directly
class Workflow {
  config: any;
  handler: any;

  constructor(config: any, handler: any) {
    this.config = config;
    this.handler = handler;
  }

  run(options: any) {
    return this.handler(options);
  }
}

export const linkOrderToStoreWorkflow = (container) => {
  return new Workflow(
    {
      id: "link-order-to-store",
      input: {
        orderId: {
          type: "string",
          required: true,
        },
        storeId: {
          type: "string",
          required: true,
        },
      },
    },
    async (input) => {
      const query = container.resolve(ContainerRegistrationKeys.QUERY);

      await query.create({
        entity: "order_store",
        data: {
          order_id: input.orderId,
          store_id: input.storeId,
        },
      });

      return {
        success: true,
      };
    }
  );
};