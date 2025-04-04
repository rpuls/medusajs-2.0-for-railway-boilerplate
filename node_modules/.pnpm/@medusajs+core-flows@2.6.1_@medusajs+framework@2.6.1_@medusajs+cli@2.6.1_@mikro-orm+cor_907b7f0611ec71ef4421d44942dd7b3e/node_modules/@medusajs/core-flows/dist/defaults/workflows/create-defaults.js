"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultsWorkflow = exports.createDefaultsWorkflowID = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const sales_channel_1 = require("../../sales-channel");
const create_default_store_1 = require("../steps/create-default-store");
exports.createDefaultsWorkflowID = "create-defaults";
/**
 * This workflow creates default data for a Medusa application, including
 * a default sales channel and store. The Medusa application uses this workflow
 * to create the default data, if not existing, when the application is first started.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create default data within your custom flows, such as seed scripts.
 *
 * @example
 * const { result } = await createDefaultsWorkflow(container)
 * .run()
 *
 * @summary
 *
 * Create default data for a Medusa application.
 */
exports.createDefaultsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createDefaultsWorkflowID, () => {
    const salesChannel = (0, sales_channel_1.createDefaultSalesChannelStep)({
        data: {
            name: "Default Sales Channel",
            description: "Created by Medusa",
        },
    });
    const store = (0, create_default_store_1.createDefaultStoreStep)({
        store: {
            default_sales_channel_id: salesChannel.id,
        },
    });
    return new workflows_sdk_1.WorkflowResponse(store);
});
//# sourceMappingURL=create-defaults.js.map