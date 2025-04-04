import { EventBusTypes, IEventBusModuleService, Message, Subscriber } from "@medusajs/framework/types";
export default class EventBusService implements IEventBusModuleService {
    emit<T>(data: Message<T> | Message<T>[], options: Record<string, unknown>): Promise<void>;
    subscribe(event: string | symbol, subscriber: Subscriber): this;
    unsubscribe(event: string | symbol, subscriber: Subscriber, context?: EventBusTypes.SubscriberContext): this;
    releaseGroupedEvents(eventGroupId: string): Promise<void>;
    clearGroupedEvents(eventGroupId: string): Promise<void>;
}
//# sourceMappingURL=mock-event-bus-service.d.ts.map