import { CreateCustomerGroupDTO } from "@medusajs/framework/types";
/**
 * The data to create customer groups.
 */
export type CreateCustomerGroupsStepInput = CreateCustomerGroupDTO[];
export declare const createCustomerGroupsStepId = "create-customer-groups";
/**
 * This step creates one or more customer groups.
 */
export declare const createCustomerGroupsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateCustomerGroupsStepInput, import("@medusajs/framework/types").CustomerGroupDTO[]>;
//# sourceMappingURL=create-customer-groups.d.ts.map