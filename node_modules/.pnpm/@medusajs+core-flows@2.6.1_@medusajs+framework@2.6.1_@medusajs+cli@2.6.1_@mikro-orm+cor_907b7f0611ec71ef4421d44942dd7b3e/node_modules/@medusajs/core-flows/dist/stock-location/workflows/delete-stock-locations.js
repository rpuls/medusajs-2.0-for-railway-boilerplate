"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStockLocationsWorkflow = exports.deleteStockLocationsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const steps_1 = require("../steps");
exports.deleteStockLocationsWorkflowId = "delete-stock-locations-workflow";
/**
 * This workflow deletes one or more stock locations. It's used by the
 * [Delete Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_deletestocklocationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete stock locations in your custom flows.
 *
 * @example
 * const { result } = await deleteStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sloc_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more stock locations.
 */
exports.deleteStockLocationsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteStockLocationsWorkflowId, (input) => {
    const softDeletedEntities = (0, steps_1.deleteStockLocationsStep)(input.ids);
    (0, remove_remote_links_1.removeRemoteLinkStep)(softDeletedEntities);
});
//# sourceMappingURL=delete-stock-locations.js.map