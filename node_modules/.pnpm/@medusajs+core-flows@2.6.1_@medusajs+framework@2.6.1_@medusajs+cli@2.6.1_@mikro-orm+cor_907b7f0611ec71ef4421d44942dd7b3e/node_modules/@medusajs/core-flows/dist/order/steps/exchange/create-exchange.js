"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderExchangesStep = exports.createOrderExchangesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createOrderExchangesStepId = "create-order-exchanges";
/**
 * This step creates one or more order exchanges.
 */
exports.createOrderExchangesStep = (0, workflows_sdk_1.createStep)(exports.createOrderExchangesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const orderExchanges = await service.createOrderExchanges(data);
    const exchangeIds = orderExchanges.map((exchange) => exchange.id);
    return new workflows_sdk_1.StepResponse(orderExchanges, exchangeIds);
}, async (exchangeIds, { container }) => {
    if (!exchangeIds) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteOrderExchanges(exchangeIds);
});
//# sourceMappingURL=create-exchange.js.map