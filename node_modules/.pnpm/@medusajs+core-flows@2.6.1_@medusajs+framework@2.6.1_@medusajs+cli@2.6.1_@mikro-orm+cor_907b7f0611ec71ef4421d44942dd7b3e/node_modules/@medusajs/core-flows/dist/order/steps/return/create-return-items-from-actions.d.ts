import { OrderChangeActionDTO } from "@medusajs/framework/types";
export type CreateReturnItemsFromActionsInput = {
    changes: OrderChangeActionDTO[];
    returnId: string;
};
/**
 * This step creates return items from change actions.
 */
export declare const createReturnItemsFromActionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateReturnItemsFromActionsInput, import("@medusajs/framework/types").OrderReturnItemDTO[]>;
//# sourceMappingURL=create-return-items-from-actions.d.ts.map