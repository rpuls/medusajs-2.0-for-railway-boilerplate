"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApiKeysWorkflow = exports.deleteApiKeysWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const steps_1 = require("../steps");
const utils_1 = require("@medusajs/framework/utils");
exports.deleteApiKeysWorkflowId = "delete-api-keys";
/**
 * This workflow deletes one or more secret or publishable API keys. It's used by the
 * [Delete API Key Admin API Route](https://docs.medusajs.com/api/admin#api-keys_deleteapikeysid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete API keys within your custom flows.
 *
 * @example
 * const { result } = await deleteApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["apk_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete secret or publishable API keys.
 */
exports.deleteApiKeysWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteApiKeysWorkflowId, (input) => {
    (0, steps_1.deleteApiKeysStep)(input.ids);
    // Please note, the ids here should be publishable key IDs
    (0, remove_remote_links_1.removeRemoteLinkStep)({
        [utils_1.Modules.API_KEY]: { publishable_key_id: input.ids },
    });
});
//# sourceMappingURL=delete-api-keys.js.map