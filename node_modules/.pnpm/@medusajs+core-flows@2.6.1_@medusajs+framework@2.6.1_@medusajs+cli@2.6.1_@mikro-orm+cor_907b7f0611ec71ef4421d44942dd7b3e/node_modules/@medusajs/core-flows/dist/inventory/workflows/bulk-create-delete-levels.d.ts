import { InventoryLevelDTO, InventoryTypes } from "@medusajs/framework/types";
export interface BulkCreateDeleteLevelsWorkflowInput {
    creates: InventoryTypes.CreateInventoryLevelInput[];
    deletes: {
        inventory_item_id: string;
        location_id: string;
    }[];
}
export declare const bulkCreateDeleteLevelsWorkflowId = "bulk-create-delete-levels-workflow";
/**
 * This workflow creates and deletes inventory levels.
 *
 * @deprecated Use `batchInventoryItemLevels` instead.
 */
export declare const bulkCreateDeleteLevelsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BulkCreateDeleteLevelsWorkflowInput, InventoryLevelDTO[], []>;
//# sourceMappingURL=bulk-create-delete-levels.d.ts.map