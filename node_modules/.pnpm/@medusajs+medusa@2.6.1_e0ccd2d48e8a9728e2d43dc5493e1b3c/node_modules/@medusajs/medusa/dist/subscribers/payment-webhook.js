"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = paymentWebhookhandler;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
async function paymentWebhookhandler({ event, container, }) {
    const paymentService = container.resolve(utils_1.Modules.PAYMENT);
    const input = event.data;
    if (input.payload?.rawData?.type === "Buffer") {
        input.payload.rawData = Buffer.from(input.payload.rawData.data);
    }
    const processedEvent = await paymentService.getWebhookActionAndData(input);
    if (processedEvent?.action === utils_1.PaymentActions.NOT_SUPPORTED ||
        // Currently none of these are handled by the processPaymentWorkflow, so we ignore them.
        // Remove once the processPaymentWorkflow is handling them.
        processedEvent?.action === utils_1.PaymentActions.CANCELED ||
        processedEvent?.action === utils_1.PaymentActions.FAILED ||
        processedEvent?.action === utils_1.PaymentActions.REQUIRES_MORE) {
        return;
    }
    if (!processedEvent.data) {
        return;
    }
    await (0, core_flows_1.processPaymentWorkflow)(container).run({
        input: processedEvent,
    });
}
exports.config = {
    event: utils_1.PaymentWebhookEvents.WebhookReceived,
    context: {
        subscriberId: "payment-webhook-handler",
    },
};
//# sourceMappingURL=payment-webhook.js.map