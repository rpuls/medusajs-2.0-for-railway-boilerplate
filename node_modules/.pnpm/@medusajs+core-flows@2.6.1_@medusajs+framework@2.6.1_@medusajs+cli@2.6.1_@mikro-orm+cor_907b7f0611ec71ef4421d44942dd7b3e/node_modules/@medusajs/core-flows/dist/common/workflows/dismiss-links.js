"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dismissLinksWorkflow = exports.dismissLinksWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const dismiss_remote_links_1 = require("../steps/dismiss-remote-links");
exports.dismissLinksWorkflowId = "dismiss-link";
/**
 * This workflow dismisses one or more links between records.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * dismiss links within your custom flows.
 *
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 *
 * @example
 * const { result } = await dismissLinksWorkflow(container)
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
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Dismiss links between two records of linked data models.
 */
exports.dismissLinksWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.dismissLinksWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, dismiss_remote_links_1.dismissRemoteLinkStep)(input));
});
//# sourceMappingURL=dismiss-links.js.map