"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeMessage = composeMessage;
/**
 * Helper function to compose and normalize a Message to be emitted by EventBus Module
 * @param eventName  Name of the event to be emitted
 * @param data The content of the message
 * @param metadata Metadata of the message
 * @param context Context from the caller service
 * @param options Options to be passed to the event bus
 */
function composeMessage(eventName, { data, source, object, action, context = {}, options, }) {
    const act = action || eventName.split(".").pop();
    if (!action /* && !Object.values(CommonEvents).includes(act as CommonEvents)*/) {
        throw new Error("Action is required if eventName is not a CommonEvent");
    }
    const metadata = {
        source,
        object,
        action: act,
    };
    if (context.eventGroupId) {
        metadata.eventGroupId = context.eventGroupId;
    }
    return {
        name: eventName,
        metadata,
        data,
        options,
    };
}
//# sourceMappingURL=build-event-messages.js.map