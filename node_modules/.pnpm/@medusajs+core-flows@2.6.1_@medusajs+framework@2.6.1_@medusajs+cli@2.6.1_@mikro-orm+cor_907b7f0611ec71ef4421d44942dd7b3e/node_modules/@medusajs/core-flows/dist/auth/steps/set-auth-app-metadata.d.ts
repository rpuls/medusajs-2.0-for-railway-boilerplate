export type SetAuthAppMetadataStepInput = {
    authIdentityId: string;
    actorType: string;
    value: string | null;
};
export declare const setAuthAppMetadataStepId = "set-auth-app-metadata";
/**
 * This step sets the `app_metadata` property of an auth identity. This is useful to
 * associate a user (whether it's an admin user or customer) with an auth identity
 * that allows them to authenticate into Medusa.
 *
 * You can learn more about auth identites in
 * [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types).
 *
 * To use this for a custom actor type, check out [this guide](https://docs.medusajs.com/resources/commerce-modules/auth/create-actor-type)
 * that explains how to create a custom `manager` actor type and manage its users.
 *
 * @example
 * To associate an auth identity with an actor type (user, customer, or other actor types):
 *
 * ```ts
 * const data = setAuthAppMetadataStep({
 *   authIdentityId: "au_1234",
 *   actorType: "user", // or `customer`, or custom type
 *   value: "user_123"
 * })
 * ```
 *
 * To remove the association with an actor type, such as when deleting the user:
 *
 * ```ts
 * const data = setAuthAppMetadataStep({
 *   authIdentityId: "au_1234",
 *   actorType: "user", // or `customer`, or custom type
 *   value: null
 * })
 * ```
 */
export declare const setAuthAppMetadataStep: import("@medusajs/framework/workflows-sdk").StepFunction<SetAuthAppMetadataStepInput, import("@medusajs/framework/types").AuthIdentityDTO>;
//# sourceMappingURL=set-auth-app-metadata.d.ts.map