import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { linkProductToStoreStep } from "./steps/link-product-to-store";
import { getStoreStep } from "./steps/get-store";

export type LinkProductToStoreInput = {
  productId: string;
  userId: string;
};

export const linkProductToStoreWorkflow = createWorkflow(
  "link-product-to-store",
  (input: LinkProductToStoreInput) => {
    const store = getStoreStep(input.userId);

    const productStoreLinkArray = linkProductToStoreStep({
      productId: input.productId,
      storeId: store.id,
    });

    return new WorkflowResponse({
      productStoreLinkArray,
      store,
    });
  }
);
