import { Context, EventBusTypes } from "@medusajs/types";
/**
 * Helper function to compose and normalize a Message to be emitted by EventBus Module
 * @param eventName  Name of the event to be emitted
 * @param data The content of the message
 * @param metadata Metadata of the message
 * @param context Context from the caller service
 * @param options Options to be passed to the event bus
 */
export declare function composeMessage(eventName: string, { data, source, object, action, context, options, }: {
    data: any;
    source: string;
    object: string;
    action?: string;
    context?: Context;
    options?: Record<string, any>;
}): EventBusTypes.Message;
//# sourceMappingURL=build-event-messages.d.ts.map