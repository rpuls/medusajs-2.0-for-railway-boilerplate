"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchLinksWorkflow = exports.batchLinksWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_remote_links_1 = require("../steps/create-remote-links");
const dismiss_remote_links_1 = require("../steps/dismiss-remote-links");
const update_remote_links_1 = require("../steps/update-remote-links");
exports.batchLinksWorkflowId = "batch-links";
/**
 * This workflow manages one or more links to create, update, or dismiss them.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage links within your custom flows.
 *
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 *
 * @example
 * const { result } = await batchLinksWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_123",
 *         },
 *         "helloModuleService": {
 *           my_custom_id: "mc_123",
 *         },
 *       }
 *     ],
 *     update: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_321",
 *         },
 *         "helloModuleService": {
 *           my_custom_id: "mc_321",
 *         },
 *         data: {
 *           metadata: {
 *             test: false
 *           }
 *         }
 *       }
 *     ],
 *     delete: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_321",
 *         },
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Manage links between two records of linked data models.
 */
exports.batchLinksWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchLinksWorkflowId, (input) => {
    const [created, updated, deleted] = (0, workflows_sdk_1.parallelize)((0, create_remote_links_1.createRemoteLinkStep)(input.create || []), (0, update_remote_links_1.updateRemoteLinksStep)(input.update || []), (0, dismiss_remote_links_1.dismissRemoteLinkStep)(input.delete || []));
    return new workflows_sdk_1.WorkflowResponse({
        created,
        updated,
        deleted,
    });
});
//# sourceMappingURL=batch-links.js.map