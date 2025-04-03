import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { getStoreStep } from "../link-product-to-store/steps/get-store";
import { linkOrderToStoreStep } from "./steps/link-order-to-store";

export type LinkOrderToStoreInput = {
  orderId: string;
  storeId?: string;
  userId?: string;
};

export const linkOrderToStoreWorkflow = createWorkflow(
  "link-order-to-store",
  (input: LinkOrderToStoreInput) => {
    const storeIdFromUser = when("get-store-id-from-user", input, (input) => {
      return !!input.userId;
    }).then(() => {
      const store = getStoreStep(input.userId);
      return store.id;
    });

    const storeId = transform(
      { storeId: input.storeId, storeIdFromUser },
      (data) => data.storeId || data.storeIdFromUser
    );

    const orderStoreLinkArray = linkOrderToStoreStep({
      orderId: input.orderId,
      storeId,
    });

    return new WorkflowResponse({
      orderStoreLinkArray,
    });
  }
);
