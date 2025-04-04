import { UpdateOrderChangeActionDTO } from "@medusajs/framework/types";
/**
 * The order change actions to update.
 */
export type UpdateOrderChangeActionsStepInput = UpdateOrderChangeActionDTO[];
export declare const updateOrderChangeActionsStepId = "update-order-change-actions";
/**
 * This step updates order change actions.
 */
export declare const updateOrderChangeActionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderChangeActionsStepInput, import("@medusajs/framework/types").OrderChangeActionDTO[]>;
//# sourceMappingURL=update-order-change-actions.d.ts.map