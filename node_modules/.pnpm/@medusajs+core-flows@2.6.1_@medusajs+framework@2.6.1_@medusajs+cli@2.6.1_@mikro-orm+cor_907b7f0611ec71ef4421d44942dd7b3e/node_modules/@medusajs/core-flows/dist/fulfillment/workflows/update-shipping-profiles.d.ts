import { FulfillmentWorkflow } from "@medusajs/framework/types";
/**
 * The updated shipping profiles.
 */
export type UpdateShippingProfilesWorkflowOutput = FulfillmentWorkflow.CreateShippingProfilesWorkflowOutput;
export declare const updateShippingProfilesWorkflowId = "update-shipping-profiles-workflow";
/**
 * This workflow updates one or more shipping profiles. It's used by the
 * [Update Shipping Profiles Admin API Route](https://docs.medusajs.com/api/admin#shipping-profiles_postshippingprofilesid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * update shipping profiles within your custom flows.
 *
 * @example
 * const { result } = await updateShippingProfilesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "sp_123",
 *     },
 *     update: {
 *       name: "Standard",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more shipping profiles.
 */
export declare const updateShippingProfilesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.UpdateShippingProfilesWorkflowInput, FulfillmentWorkflow.CreateShippingProfilesWorkflowOutput, []>;
//# sourceMappingURL=update-shipping-profiles.d.ts.map