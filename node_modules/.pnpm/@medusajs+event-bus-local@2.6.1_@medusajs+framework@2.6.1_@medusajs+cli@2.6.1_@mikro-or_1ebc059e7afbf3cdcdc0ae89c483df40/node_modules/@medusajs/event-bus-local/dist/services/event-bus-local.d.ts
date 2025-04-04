import { EventBusTypes, InternalModuleDeclaration, Logger, MedusaContainer, Message, Subscriber } from "@medusajs/framework/types";
import { AbstractEventBusModuleService } from "@medusajs/framework/utils";
import { EventEmitter } from "events";
type InjectedDependencies = {
    logger: Logger;
};
type StagingQueueType = Map<string, Message[]>;
export default class LocalEventBusService extends AbstractEventBusModuleService {
    protected readonly logger_?: Logger;
    protected readonly eventEmitter_: EventEmitter;
    protected groupedEventsMap_: StagingQueueType;
    constructor({ logger }: MedusaContainer & InjectedDependencies, moduleOptions: {} | undefined, moduleDeclaration: InternalModuleDeclaration);
    /**
     * Accept an event name and some options
     *
     * @param eventsData
     * @param options The options can include `internal` which will prevent the event from being logged
     */
    emit<T = unknown>(eventsData: Message<T> | Message<T>[], options?: Record<string, unknown>): Promise<void>;
    private groupOrEmitEvent;
    private groupEvent;
    releaseGroupedEvents(eventGroupId: string): Promise<void>;
    clearGroupedEvents(eventGroupId: string): Promise<void>;
    subscribe(event: string | symbol, subscriber: Subscriber, context?: EventBusTypes.SubscriberContext): this;
    unsubscribe(event: string | symbol, subscriber: Subscriber, context: EventBusTypes.SubscriberContext): this;
}
export {};
//# sourceMappingURL=event-bus-local.d.ts.map