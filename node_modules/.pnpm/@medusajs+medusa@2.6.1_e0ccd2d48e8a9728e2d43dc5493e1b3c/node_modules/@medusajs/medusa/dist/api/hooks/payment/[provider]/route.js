"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    try {
        const { provider } = req.params;
        const options = 
        // @ts-expect-error "Not sure if .options exists on a module"
        req.scope.resolve(utils_1.Modules.PAYMENT).options || {};
        const event = {
            provider,
            payload: { data: req.body, rawData: req.rawBody, headers: req.headers },
        };
        const eventBus = req.scope.resolve(utils_1.Modules.EVENT_BUS);
        // we delay the processing of the event to avoid a conflict caused by a race condition
        await eventBus.emit({
            name: utils_1.PaymentWebhookEvents.WebhookReceived,
            data: event,
        }, {
            delay: options.webhook_delay || 5000,
            attempts: options.webhook_retries || 3,
        });
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    res.sendStatus(200);
};
exports.POST = POST;
//# sourceMappingURL=route.js.map