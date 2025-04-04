import { FilterableShippingProfileProps, ShippingProfileDTO } from "../../fulfillment";
/**
 * The details of a shipping profile to create.
 */
interface CreateShippingProfile {
    /**
     * The name of the shipping profile.
     */
    name: string;
    /**
     * The type of the shipping profile.
     */
    type: string;
}
/**
 * The data to create shipping profiles.
 */
export interface CreateShippingProfilesWorkflowInput {
    /**
     * The shipping profiles to create.
     */
    data: CreateShippingProfile[];
}
/**
 * The created shipping profiles.
 */
export type CreateShippingProfilesWorkflowOutput = ShippingProfileDTO[];
interface UpdateShippingProfile {
    name?: string;
    type?: string;
}
/**
 * The data to update a shipping profile.
 */
export interface UpdateShippingProfilesWorkflowInput {
    /**
     * The filter to select the shipping profiles to update.
     */
    selector: FilterableShippingProfileProps;
    /**
     * The data to update in the shipping profile.
     */
    update: UpdateShippingProfile;
}
export {};
//# sourceMappingURL=shipping-profiles.d.ts.map