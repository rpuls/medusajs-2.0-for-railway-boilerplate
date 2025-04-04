"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitEventStep = exports.emitEventStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.emitEventStepId = "emit-event-step";
/**
 * Emit an event.
 *
 * @example
 * emitEventStep({
 *   eventName: "custom.created",
 *   data: {
 *     id: "123"
 *   }
 * })
 */
exports.emitEventStep = (0, workflows_sdk_1.createStep)(exports.emitEventStepId, async (input, context) => {
    if (!input?.data) {
        return;
    }
    const { container } = context;
    const eventBus = container.resolve(utils_1.Modules.EVENT_BUS);
    const data_ = typeof input.data === "function" ? await input.data(context) : input.data;
    const metadata = {
        ...input.metadata,
    };
    if (context.eventGroupId) {
        metadata.eventGroupId = context.eventGroupId;
    }
    const dataArray = Array.isArray(data_) ? data_ : [data_];
    const message = dataArray.map((dt) => ({
        name: input.eventName,
        data: dt,
        options: input.options,
        metadata,
    }));
    if (!message.length) {
        return;
    }
    await eventBus.emit(message);
}, async (data) => { });
//# sourceMappingURL=emit-event.js.map