import { CreateShippingProfileDTO } from "@medusajs/framework/types";
/**
 * The shipping profiles to create.
 */
export type CreateShippingProfilesStepInput = CreateShippingProfileDTO[];
export declare const createShippingProfilesStepId = "create-shipping-profiles";
/**
 * This step creates one or more shipping profiles.
 */
export declare const createShippingProfilesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateShippingProfilesStepInput, import("@medusajs/framework/types").ShippingProfileDTO[]>;
//# sourceMappingURL=create-shipping-profiles.d.ts.map