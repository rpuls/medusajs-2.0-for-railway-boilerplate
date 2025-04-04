"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const workflowEngineService = req.scope.resolve(utils_1.Modules.WORKFLOW_ENGINE);
    const { workflow_id } = req.query;
    const subscriberId = "__sub__" + Math.random().toString(36).substring(2, 9);
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    req.on("close", () => {
        res.end();
        void workflowEngineService.unsubscribe({
            workflowId: workflow_id,
            subscriberOrId: subscriberId,
        });
    });
    req.on("error", (err) => {
        if (err.code === "ECONNRESET") {
            res.end();
        }
    });
    void workflowEngineService.subscribe({
        workflowId: workflow_id,
        subscriber: async (args) => {
            const { eventType, workflowId, transactionId, step, response, result, errors, } = args;
            const data = {
                event_type: eventType,
                workflow_id: workflowId,
                transaction_id: transactionId,
                step,
                response,
                result,
                errors,
            };
            res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
        },
        subscriberId,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map