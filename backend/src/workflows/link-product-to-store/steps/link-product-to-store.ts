import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

type LinkProductToStoreStepInput = {
  productId: string;
  storeId: string;
};

export const linkProductToStoreStep = createStep(
  "link-product-to-store",
  async (
    { productId, storeId }: LinkProductToStoreStepInput,
    { container }
  ) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const linkArray = remoteLink.create({
      [Modules.PRODUCT]: {
        product_id: productId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });

    return new StepResponse(linkArray, {
      productId,
      storeId
    });
  },
  async ({ productId, storeId }, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    remoteLink.dismiss({
      [Modules.PRODUCT]: {
        product_id: productId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });
  }
);
