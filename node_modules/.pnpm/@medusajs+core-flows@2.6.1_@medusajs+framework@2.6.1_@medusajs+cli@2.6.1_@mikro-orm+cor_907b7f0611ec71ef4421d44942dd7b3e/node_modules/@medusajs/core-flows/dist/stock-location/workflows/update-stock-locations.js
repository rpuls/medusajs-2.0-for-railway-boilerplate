"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockLocationsWorkflow = exports.updateStockLocationsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
const upsert_stock_location_addresses_1 = require("../steps/upsert-stock-location-addresses");
exports.updateStockLocationsWorkflowId = "update-stock-locations-workflow";
/**
 * This workflow updates stock locations matching the specified filters. It's used by the
 * [Update Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update stock locations in your custom flows.
 *
 * @example
 * const { result } = await updateStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "sloc_123"
 *     },
 *     update: {
 *       name: "European Warehouse"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update stock locations.
 */
exports.updateStockLocationsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateStockLocationsWorkflowId, (input) => {
    const stockLocationsQuery = (0, common_1.useQueryGraphStep)({
        entity: "stock_location",
        filters: input.selector,
        fields: ["id", "address.id"],
    }).config({ name: "get-stock-location" });
    const stockLocations = (0, workflows_sdk_1.transform)({ stockLocationsQuery }, ({ stockLocationsQuery }) => stockLocationsQuery.data);
    const normalizedData = (0, workflows_sdk_1.transform)({ input, stockLocations }, ({ input, stockLocations }) => {
        const { address, address_id, ...stockLocationInput } = input.update;
        const addressesInput = [];
        if (address) {
            for (const stockLocation of stockLocations) {
                if (stockLocation.address?.id) {
                    addressesInput.push({
                        id: stockLocation.address?.id,
                        ...address,
                    });
                }
                else {
                    addressesInput.push(address);
                }
            }
        }
        return {
            stockLocationInput: {
                selector: input.selector,
                update: stockLocationInput,
            },
            addressesInput,
        };
    });
    (0, upsert_stock_location_addresses_1.upsertStockLocationAddressesStep)(normalizedData.addressesInput);
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateStockLocationsStep)(normalizedData.stockLocationInput));
});
//# sourceMappingURL=update-stock-locations.js.map