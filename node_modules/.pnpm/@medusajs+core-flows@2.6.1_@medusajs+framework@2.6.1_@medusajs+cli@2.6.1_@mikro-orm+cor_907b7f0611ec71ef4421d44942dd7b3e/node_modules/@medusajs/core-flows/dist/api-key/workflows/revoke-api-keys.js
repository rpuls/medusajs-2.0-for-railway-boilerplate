"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiKeysWorkflow = exports.revokeApiKeysWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.revokeApiKeysWorkflowId = "revoke-api-keys";
/**
 * This workflow revokes one or more API keys. If the API key is a secret,
 * it can't be used for authentication anymore. If it's publishable, it can't be used by client applications.
 *
 * This workflow is used by the [Revoke API Key API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysidrevoke).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * revoke API keys within your custom flows.
 *
 * @example
 * const { result } = await revokeApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "apk_123"
 *     },
 *     revoke: {
 *       revoked_by: "user_123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Revoke secret or publishable API keys.
 */
exports.revokeApiKeysWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.revokeApiKeysWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.revokeApiKeysStep)(input));
});
//# sourceMappingURL=revoke-api-keys.js.map