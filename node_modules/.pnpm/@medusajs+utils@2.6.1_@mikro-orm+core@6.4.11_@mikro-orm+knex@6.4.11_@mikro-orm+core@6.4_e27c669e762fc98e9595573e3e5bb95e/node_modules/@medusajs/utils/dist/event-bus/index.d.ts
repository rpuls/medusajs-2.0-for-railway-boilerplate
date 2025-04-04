import { EventBusTypes, InternalModuleDeclaration } from "@medusajs/types";
export declare abstract class AbstractEventBusModuleService implements EventBusTypes.IEventBusModuleService {
    protected isWorkerMode: boolean;
    protected eventToSubscribersMap_: Map<string | symbol, EventBusTypes.SubscriberDescriptor[]>;
    get eventToSubscribersMap(): Map<string | symbol, EventBusTypes.SubscriberDescriptor[]>;
    protected constructor(cradle: Record<string, unknown>, moduleOptions: {} | undefined, moduleDeclaration: InternalModuleDeclaration);
    abstract emit<T>(data: EventBusTypes.Message<T> | EventBusTypes.Message<T>[], options: Record<string, unknown>): Promise<void>;
    abstract releaseGroupedEvents(eventGroupId: string): Promise<void>;
    abstract clearGroupedEvents(eventGroupId: string): Promise<void>;
    protected storeSubscribers({ event, subscriberId, subscriber, }: {
        event: string | symbol;
        subscriberId: string;
        subscriber: EventBusTypes.Subscriber;
    }): void;
    subscribe(eventName: string | symbol, subscriber: EventBusTypes.Subscriber, context?: EventBusTypes.SubscriberContext): this;
    unsubscribe(eventName: string | symbol, subscriber: EventBusTypes.Subscriber, context?: EventBusTypes.SubscriberContext): this;
}
export * from "./build-event-messages";
export * from "./common-events";
export * from "./message-aggregator";
export * from "./utils";
//# sourceMappingURL=index.d.ts.map