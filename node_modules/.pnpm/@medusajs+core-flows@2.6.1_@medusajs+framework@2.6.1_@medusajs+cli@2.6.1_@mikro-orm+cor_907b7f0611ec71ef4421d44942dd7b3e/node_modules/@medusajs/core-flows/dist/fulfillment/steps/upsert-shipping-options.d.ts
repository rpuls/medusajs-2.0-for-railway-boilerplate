import { FulfillmentWorkflow, ShippingOptionDTO } from "@medusajs/framework/types";
/**
 * The data to create or update shipping options.
 */
export type UpsertShippingOptionsStepInput = Omit<FulfillmentWorkflow.CreateShippingOptionsWorkflowInput | FulfillmentWorkflow.UpdateShippingOptionsWorkflowInput, "prices">[];
export declare const upsertShippingOptionsStepId = "create-shipping-options-step";
/**
 * This step creates or updates shipping options.
 */
export declare const upsertShippingOptionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpsertShippingOptionsStepInput, ShippingOptionDTO[]>;
//# sourceMappingURL=upsert-shipping-options.d.ts.map