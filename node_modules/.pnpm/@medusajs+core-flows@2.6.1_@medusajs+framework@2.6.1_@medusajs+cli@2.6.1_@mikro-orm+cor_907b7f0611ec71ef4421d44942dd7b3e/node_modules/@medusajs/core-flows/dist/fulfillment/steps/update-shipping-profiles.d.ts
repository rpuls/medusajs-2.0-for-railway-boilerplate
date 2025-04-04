import { FilterableShippingProfileProps, UpdateShippingProfileDTO } from "@medusajs/framework/types";
/**
 * The data to update a shipping profile.
 */
export type UpdateShippingProfilesStepInput = {
    /**
     * The data to update in the shipping profiles.
     */
    update: UpdateShippingProfileDTO;
    /**
     * The filters to select the shipping profiles to update.
     */
    selector: FilterableShippingProfileProps;
};
export declare const updateShippingProfilesStepId = "update-shipping-profiles";
/**
 * This step updates shipping profiles matching the specified filters.
 *
 * @example
 * const data = updateShippingProfilesStep({
 *   selector: {
 *     id: "sp_123"
 *   },
 *   update: {
 *     name: "Standard"
 *   }
 * })
 */
export declare const updateShippingProfilesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateShippingProfilesStepInput, import("@medusajs/framework/types").ShippingProfileDTO[]>;
//# sourceMappingURL=update-shipping-profiles.d.ts.map