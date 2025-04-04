import { CreateUserDTO, UserDTO } from "@medusajs/framework/types";
/**
 * The details of the user account to create.
 */
export type CreateUserAccountWorkflowInput = {
    /**
     * The ID of the auth identity to attach the user to.
     */
    authIdentityId: string;
    /**
     * The details of the user to create.
     */
    userData: CreateUserDTO;
};
export declare const createUserAccountWorkflowId = "create-user-account";
/**
 * This workflow creates a user and attaches it to an auth identity.
 *
 * You can create an auth identity first using the [Retrieve Registration JWT Token API Route](https://docs.medusajs.com/api/admin#auth_postactor_typeauth_provider_register).
 * Learn more about basic authentication flows in [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/authentication-route).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * register or create user accounts within your custom flows.
 *
 * @example
 * const { result } = await createUserAccountWorkflow(container)
 * .run({
 *   input: {
 *     authIdentityId: "au_123",
 *     userData: {
 *       email: "example@gmail.com",
 *       first_name: "John",
 *       last_name: "Doe",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create a user account and attach an auth identity.
 */
export declare const createUserAccountWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateUserAccountWorkflowInput, UserDTO, []>;
//# sourceMappingURL=create-user-account.d.ts.map