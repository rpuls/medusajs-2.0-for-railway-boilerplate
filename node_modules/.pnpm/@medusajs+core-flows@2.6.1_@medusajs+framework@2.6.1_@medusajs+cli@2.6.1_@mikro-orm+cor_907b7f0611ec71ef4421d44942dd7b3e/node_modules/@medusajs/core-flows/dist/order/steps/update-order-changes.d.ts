import { UpdateOrderChangeDTO } from "@medusajs/framework/types";
/**
 * The order changes to update.
 */
export type UpdateOrderChangesStepInput = UpdateOrderChangeDTO[];
export declare const updateOrderChangesStepId = "update-order-changes";
/**
 * This step updates order change.
 */
export declare const updateOrderChangesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderChangesStepInput, import("@medusajs/framework/types").OrderChangeDTO[]>;
//# sourceMappingURL=update-order-changes.d.ts.map