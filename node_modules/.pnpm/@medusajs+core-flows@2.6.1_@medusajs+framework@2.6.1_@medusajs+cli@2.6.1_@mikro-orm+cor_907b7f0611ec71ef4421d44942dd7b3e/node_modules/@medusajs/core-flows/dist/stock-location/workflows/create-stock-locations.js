"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockLocationsWorkflow = exports.createStockLocationsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createStockLocationsWorkflowId = "create-stock-locations-workflow";
/**
 * This workflow creates one or more stock locations. It's used by the
 * [Create Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocations).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create stock locations in your custom flows.
 *
 * @example
 * const { result } = await createStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     locations: [
 *       {
 *         name: "European Warehouse",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more stock locations.
 */
exports.createStockLocationsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createStockLocationsWorkflowId, (input) => {
    const stockLocations = (0, steps_1.createStockLocations)(input.locations);
    const stockLocationsCreated = (0, workflows_sdk_1.createHook)("stockLocationsCreated", {
        stockLocations,
    });
    return new workflows_sdk_1.WorkflowResponse(stockLocations, {
        hooks: [stockLocationsCreated],
    });
});
//# sourceMappingURL=create-stock-locations.js.map