import { CreateUserDTO } from "@medusajs/framework/types";
export declare const createUsersStepId = "create-users-step";
/**
 * This step creates one or more users. To allow these users to log in,
 * you must attach an auth identity to each user using the {@link setAuthAppMetadataStep}.
 *
 * @example
 * const data = createUsersStep([
 *   {
 *     email: "example@gmail.com",
 *     first_name: "John",
 *     last_name: "Doe",
 *   }
 * ])
 */
export declare const createUsersStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateUserDTO[], import("@medusajs/framework/types").UserDTO[]>;
//# sourceMappingURL=create-users.d.ts.map