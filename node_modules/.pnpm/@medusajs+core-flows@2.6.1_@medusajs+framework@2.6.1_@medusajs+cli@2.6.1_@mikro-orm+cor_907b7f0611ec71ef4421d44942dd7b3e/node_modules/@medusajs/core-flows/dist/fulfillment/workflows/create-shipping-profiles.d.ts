import { FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const createShippingProfilesWorkflowId = "create-shipping-profiles-workflow";
/**
 * This workflow creates one or more shipping profiles. It's used by the
 * [Create Shipping Profile Admin API Route](https://docs.medusajs.com/api/admin#shipping-profiles_postshippingprofiles).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create shipping profiles within your custom flows.
 *
 * @example
 * const { result } = await createShippingProfilesWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         name: "Standard",
 *         type: "standard"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more shipping profiles.
 */
export declare const createShippingProfilesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.CreateShippingProfilesWorkflowInput, FulfillmentWorkflow.CreateShippingProfilesWorkflowOutput, []>;
//# sourceMappingURL=create-shipping-profiles.d.ts.map