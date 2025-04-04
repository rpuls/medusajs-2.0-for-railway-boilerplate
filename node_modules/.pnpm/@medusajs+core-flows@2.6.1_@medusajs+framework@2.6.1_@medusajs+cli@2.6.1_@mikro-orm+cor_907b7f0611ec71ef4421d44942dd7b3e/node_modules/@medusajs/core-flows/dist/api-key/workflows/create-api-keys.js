"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiKeysWorkflow = exports.createApiKeysWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createApiKeysWorkflowId = "create-api-keys";
/**
 * This workflow creates one or more API keys, which can be secret or publishable. It's used by the
 * [Create API Key Admin API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeys).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create API keys within your custom flows.
 *
 * @example
 * const { result } = await createApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     api_keys: [
 *       {
 *         type: "publishable",
 *         title: "Storefront",
 *         created_by: "user_123"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create secret or publishable API keys.
 */
exports.createApiKeysWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createApiKeysWorkflowId, (input) => {
    const apiKeys = (0, steps_1.createApiKeysStep)(input);
    const apiKeysCreated = (0, workflows_sdk_1.createHook)("apiKeysCreated", {
        apiKeys,
    });
    return new workflows_sdk_1.WorkflowResponse(apiKeys, {
        hooks: [apiKeysCreated],
    });
});
//# sourceMappingURL=create-api-keys.js.map