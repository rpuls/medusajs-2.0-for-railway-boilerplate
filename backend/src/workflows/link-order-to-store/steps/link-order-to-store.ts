import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

type LinkOrderToStoreStepInput = {
  orderId: string;
  storeId: string;
};

export const linkOrderToStoreStep = createStep(
  "link-order-to-store",
  async ({ orderId, storeId }: LinkOrderToStoreStepInput, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const linkArray = remoteLink.create({
      [Modules.ORDER]: {
        order_id: orderId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });

    return new StepResponse(linkArray, {
      orderId,
      storeId,
    });
  },
  async ({ orderId, storeId }, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    remoteLink.dismiss({
      [Modules.ORDER]: {
        order_id: orderId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });
  }
);
