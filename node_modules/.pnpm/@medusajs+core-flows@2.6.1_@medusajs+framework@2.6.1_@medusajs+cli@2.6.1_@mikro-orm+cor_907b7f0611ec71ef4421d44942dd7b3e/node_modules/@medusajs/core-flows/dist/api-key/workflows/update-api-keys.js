"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApiKeysWorkflow = exports.updateApiKeysWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateApiKeysWorkflowId = "update-api-keys";
/**
 * This workflow updates one or more secret or publishable API keys. It's used by the
 * [Update API Key Admin API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update API keys within your custom flows.
 *
 * @example
 * const { result } = await updateApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "apk_123"
 *     },
 *     update: {
 *       title: "Storefront"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update secret or publishable API keys.
 */
exports.updateApiKeysWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateApiKeysWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateApiKeysStep)(input));
});
//# sourceMappingURL=update-api-keys.js.map