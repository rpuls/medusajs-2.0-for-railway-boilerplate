"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmitEvents = EmitEvents;
const event_bus_1 = require("../../event-bus");
const inject_into_context_1 = require("./inject-into-context");
/**
 * @internal this decorator is not meant to be used except by the internal team for now
 *
 * @param options
 * @constructor
 */
function EmitEvents(options = {}) {
    return function (target, propertyKey, descriptor) {
        (0, inject_into_context_1.InjectIntoContext)({
            messageAggregator: () => new event_bus_1.MessageAggregator(),
        })(target, propertyKey, descriptor);
        const original = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await original.apply(this, args);
            if (!target.emitEvents_) {
                const logger = Object.keys(this.__container__ ?? {}).includes("logger")
                    ? this.__container__.logger
                    : console;
                logger.warn(`No emitEvents_ method found on ${target.constructor.name}. No events emitted. To be able to use the @EmitEvents() you need to have the emitEvents_ method implemented in the class.`);
            }
            const argIndex = target.MedusaContextIndex_[propertyKey];
            const aggregator = args[argIndex].messageAggregator;
            if (aggregator.count() > 0) {
                await target.emitEvents_.apply(this, [aggregator.getMessages(options)]);
                aggregator.clearMessages();
            }
            return result;
        };
    };
}
//# sourceMappingURL=emit-events.js.map