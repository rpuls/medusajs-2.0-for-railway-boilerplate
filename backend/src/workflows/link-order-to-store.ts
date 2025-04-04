import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Workflow } from "@medusajs/workflows-sdk";

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