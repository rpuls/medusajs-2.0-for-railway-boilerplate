import { UpdateUserDTO } from "@medusajs/framework/types";
export declare const updateUsersStepId = "update-users-step";
/**
 * This step updates one or more users.
 *
 * @example
 * const data = updateUsersStep([
 *   {
 *     id: "user_123",
 *     last_name: "Doe",
 *   }
 * ])
 */
export declare const updateUsersStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateUserDTO[], import("@medusajs/framework/types").UserDTO[]>;
//# sourceMappingURL=update-users.d.ts.map