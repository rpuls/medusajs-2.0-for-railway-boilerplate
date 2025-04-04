/**
 * The data to validate the deletion of shipping profiles.
 */
export type ValidateStepShippingProfileDeleteInput = {
    /**
     * The links between products and shipping profiles.
     */
    links: {
        /**
         * The ID of the product linked to the shipping profile.
         */
        product_id: string;
        /**
         * The ID of the shipping profile to be deleted.
         */
        shipping_profile_id: string;
    }[];
};
/**
 * This step validates that the shipping profiles to delete are not linked to any products.
 * Otherwise, an error is thrown.
 *
 * @example
 * validateStepShippingProfileDelete({
 *   links: [
 *     {
 *       product_id: "product_123",
 *       shipping_profile_id: "sp_123"
 *     }
 *   ]
 * })
 */
export declare const validateStepShippingProfileDelete: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateStepShippingProfileDeleteInput, unknown>;
/**
 * The data to delete shipping profiles.
 */
export type DeleteShippingProfilesWorkflowInput = {
    /**
     * The IDs of the shipping profiles to delete.
     */
    ids: string[];
};
export declare const deleteShippingProfileWorkflowId = "delete-shipping-profile-workflow";
/**
 * This workflow deletes one or more shipping profiles. It's used by the
 * [Delete Shipping Profile Admin API Route](https://docs.medusajs.com/api/admin#shipping-profiles_deleteshippingprofilesid).
 * Shipping profiles that are linked to products cannot be deleted.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete shipping profiles within your custom flows.
 *
 * @example
 * const { result } = await deleteShippingProfileWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sp_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete shipping profiles.
 */
export declare const deleteShippingProfileWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteShippingProfilesWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-shipping-profile.d.ts.map