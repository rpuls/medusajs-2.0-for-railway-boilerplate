"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLinksWorkflow = exports.createLinksWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_remote_links_1 = require("../steps/create-remote-links");
exports.createLinksWorkflowId = "create-link";
/**
 * This workflow creates one or more links between records.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create links within your custom flows.
 *
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 *
 * @example
 * const { result } = await createLinksWorkflow(container)
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
 * Create links between two records of linked data models.
 */
exports.createLinksWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createLinksWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, create_remote_links_1.createRemoteLinkStep)(input));
});
//# sourceMappingURL=create-links.js.map