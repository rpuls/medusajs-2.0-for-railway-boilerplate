import { PaginatedResponse } from "../../common";
import { InventoryLevel } from "./entities";
export interface AdminInventoryLevelResponse {
    /**
     * The inventory level's details.
     */
    inventory_level: InventoryLevel;
}
export type AdminInventoryLevelListResponse = PaginatedResponse<{
    /**
     * The list of inventory levels.
     */
    inventory_levels: InventoryLevel[];
}>;
/**
 * The result of creating, updating or deleting inventory levels.
 */
export interface AdminBatchInventoryItemLocationLevelsResponse {
    /**
     * The created inventory levels.
     */
    created?: InventoryLevel[];
    /**
     * The updated inventory levels.
     */
    updated?: InventoryLevel[];
    /**
     * The IDs of the deleted inventory levels.
     */
    deleted?: string[];
}
/**
 * The result of creating, updating or deleting inventory levels.
 */
export interface AdminBatchInventoryItemsLocationLevelsResponse extends AdminBatchInventoryItemLocationLevelsResponse {
}
//# sourceMappingURL=responses.d.ts.map