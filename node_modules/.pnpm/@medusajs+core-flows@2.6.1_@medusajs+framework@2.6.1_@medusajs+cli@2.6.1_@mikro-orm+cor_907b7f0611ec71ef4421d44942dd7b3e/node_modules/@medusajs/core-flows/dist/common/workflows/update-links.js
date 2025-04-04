"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLinksWorkflow = exports.updateLinksWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_remote_links_1 = require("../steps/update-remote-links");
exports.updateLinksWorkflowId = "update-link";
/**
 * This workflow updates one or more links between records.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update links within your custom flows.
 *
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 *
 * @example
 * const { result } = await updateLinksWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       // import { Modules } from "@medusajs/framework/utils"
 *       [Modules.PRODUCT]: {
 *         product_id: "prod_123",
 *       },
 *       "helloModuleService": {
 *         my_custom_id: "mc_123",
 *       },
 *       data: {
 *         metadata: {
 *           test: false,
 *         },
 *       }
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Update links between two records of linked data models.
 */
exports.updateLinksWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateLinksWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, update_remote_links_1.updateRemoteLinksStep)(input));
});
//# sourceMappingURL=update-links.js.map