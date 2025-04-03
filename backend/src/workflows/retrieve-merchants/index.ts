import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { getStoreStep } from "../link-product-to-store/steps/get-store";
import { retrieveMerchantsStep } from "./steps/retrieve-merchants";

export type RetrieveMerchantsWorkflowInput = {
  userId: string;
};

export const retrieveMerchantsWorkflow = createWorkflow(
  "retrieve-merchants",
  (input: RetrieveMerchantsWorkflowInput) => {
    const store = getStoreStep(input.userId);

    const isSuperAdmin = transform({ store }, (data) => !data.store);

    const merchants = retrieveMerchantsStep({
      userId: input.userId,
      isSuperAdmin,
    });

    return new WorkflowResponse(merchants);
  }
);
