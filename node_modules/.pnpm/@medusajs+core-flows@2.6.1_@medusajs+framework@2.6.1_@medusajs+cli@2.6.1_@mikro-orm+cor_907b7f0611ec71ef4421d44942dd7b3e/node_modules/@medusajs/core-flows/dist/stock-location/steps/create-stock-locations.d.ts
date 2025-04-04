import { CreateStockLocationInput } from "@medusajs/framework/types";
/**
 * The stock locations to create.
 */
export type CreateStockLocationsStepInput = CreateStockLocationInput[];
export declare const createStockLocationsStepId = "create-stock-locations";
/**
 * This step creates one or more stock locations.
 */
export declare const createStockLocations: import("@medusajs/framework/workflows-sdk").StepFunction<CreateStockLocationsStepInput, import("@medusajs/framework/types").StockLocationDTO[]>;
//# sourceMappingURL=create-stock-locations.d.ts.map