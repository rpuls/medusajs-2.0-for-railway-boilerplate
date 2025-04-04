"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSalesChannelStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateSalesChannelStep = (0, workflows_sdk_1.createStep)("validate-sales-channel", async (data) => {
    const { salesChannel } = data;
    if (!salesChannel?.id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Sales channel is required when creating a cart. Either provide a sales channel ID or set the default sales channel for the store.");
    }
    return new workflows_sdk_1.StepResponse(void 0);
});
//# sourceMappingURL=validate-sales-channel.js.map