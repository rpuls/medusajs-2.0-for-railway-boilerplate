import { UpsertStockLocationAddressInput } from "@medusajs/framework/types";
/**
 * The data to upsert stock location addresses.
 */
export type UpsertStockLocationAddressesStepInput = UpsertStockLocationAddressInput[];
export declare const upsertStockLocationAddressesStepId = "upsert-stock-location-addresses-step";
/**
 * This step upserts stock location addresses matching the specified filters.
 */
export declare const upsertStockLocationAddressesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpsertStockLocationAddressInput[], import("@medusajs/framework/types").StockLocationAddressDTO[]>;
//# sourceMappingURL=upsert-stock-location-addresses.d.ts.map