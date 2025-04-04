"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkSalesChannelsToApiKeyWorkflow = exports.linkSalesChannelsToApiKeyWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.linkSalesChannelsToApiKeyWorkflowId = "link-sales-channels-to-api-key";
/**
 * This workflow manages the sales channels of a publishable API key. It's used by the
 * [Manage Sales Channels API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysidsaleschannels).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the sales channels of a publishable API key within your custom flows.
 *
 * @example
 * const { result } = await linkSalesChannelsToApiKeyWorkflow(container)
 * .run({
 *   input: {
 *     id: "apk_132",
 *     add: ["sc_123"],
 *     remove: ["sc_321"]
 *   }
 * })
 *
 * @summary
 * Manage the sales channels of a publishable API key.
 */
exports.linkSalesChannelsToApiKeyWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.linkSalesChannelsToApiKeyWorkflowId, (input) => {
    (0, steps_1.validateSalesChannelsExistStep)({
        sales_channel_ids: input.add ?? [],
    });
    (0, steps_1.linkSalesChannelsToApiKeyStep)(input);
});
//# sourceMappingURL=link-sales-channels-to-publishable-key.js.map