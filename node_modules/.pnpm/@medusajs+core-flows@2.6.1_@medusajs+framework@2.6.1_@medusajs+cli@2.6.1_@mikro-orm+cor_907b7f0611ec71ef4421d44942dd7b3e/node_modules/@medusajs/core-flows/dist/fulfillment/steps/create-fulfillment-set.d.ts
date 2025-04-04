import { CreateFulfillmentSetDTO } from "@medusajs/framework/types";
/**
 * The data to create one or more fulfillment sets.
 */
export type CreateFulfillmentSetsStepInput = CreateFulfillmentSetDTO[];
export declare const createFulfillmentSetsId = "create-fulfillment-sets";
/**
 * This step creates one or more fulfillment sets.
 */
export declare const createFulfillmentSets: import("@medusajs/framework/workflows-sdk").StepFunction<CreateFulfillmentSetsStepInput, import("@medusajs/framework/types").FulfillmentSetDTO[]>;
//# sourceMappingURL=create-fulfillment-set.d.ts.map