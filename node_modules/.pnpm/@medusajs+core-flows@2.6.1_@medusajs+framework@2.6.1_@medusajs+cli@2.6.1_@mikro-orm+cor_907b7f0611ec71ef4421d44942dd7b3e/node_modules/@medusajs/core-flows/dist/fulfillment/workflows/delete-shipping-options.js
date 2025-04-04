"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingOptionsWorkflow = exports.deleteShippingOptionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const common_1 = require("../../common");
exports.deleteShippingOptionsWorkflowId = "delete-shipping-options-workflow";
/**
 * This workflow deletes one or more shipping options. It's used by the
 * [Delete Shipping Options Admin API Route](https://docs.medusajs.com/api/admin#shipping-options_deleteshippingoptionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete shipping options within your custom flows.
 *
 * @example
 * const { result } = await deleteShippingOptionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["so_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more shipping options.
 */
exports.deleteShippingOptionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteShippingOptionsWorkflowId, (input) => {
    const softDeletedEntities = (0, steps_1.deleteShippingOptionsStep)(input.ids);
    (0, common_1.removeRemoteLinkStep)(softDeletedEntities);
});
//# sourceMappingURL=delete-shipping-options.js.map