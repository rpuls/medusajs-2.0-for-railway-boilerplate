"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleEventBuilderFactory = moduleEventBuilderFactory;
const utils_1 = require("../event-bus/utils");
// TODO should that move closer to the event bus? and maybe be rename to modulemoduleEventBuilderFactory
/**
 *
 * Factory function to create event builders for different entities
 *
 * @example
 * const createdFulfillment = moduleEventBuilderFactory({
 *   source: Modules.FULFILLMENT,
 *   action: CommonEvents.CREATED,
 *   object: "fulfillment",
 *   eventsEnum: FulfillmentEvents,
 * })
 *
 * createdFulfillment({
 *   data,
 *   sharedContext,
 * })
 *
 * @param action
 * @param object
 * @param eventsEnum
 * @param service
 */
function moduleEventBuilderFactory({ action, object, eventName, source, }) {
    return function ({ data, sharedContext, }) {
        data = Array.isArray(data) ? data : [data];
        if (!data.length) {
            return;
        }
        const aggregator = sharedContext.messageAggregator;
        const messages = [];
        if (!eventName) {
            eventName = (0, utils_1.buildModuleResourceEventName)({
                prefix: source,
                objectName: object,
                action,
            });
        }
        data.forEach((dataItem) => {
            messages.push({
                source,
                action,
                context: sharedContext,
                data: { id: dataItem.id },
                eventName: eventName,
                object,
            });
        });
        aggregator.saveRawMessageData(messages);
    };
}
//# sourceMappingURL=event-builder-factory.js.map