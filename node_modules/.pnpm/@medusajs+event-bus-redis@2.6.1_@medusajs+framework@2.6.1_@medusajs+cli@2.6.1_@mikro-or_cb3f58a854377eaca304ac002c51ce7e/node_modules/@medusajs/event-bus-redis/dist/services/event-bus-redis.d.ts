import { InternalModuleDeclaration, Logger, Message } from "@medusajs/framework/types";
import { AbstractEventBusModuleService } from "@medusajs/framework/utils";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { BullJob, EventBusRedisModuleOptions, Options } from "../types";
type InjectedDependencies = {
    logger: Logger;
    eventBusRedisConnection: Redis;
};
/**
 * Can keep track of multiple subscribers to different events and run the
 * subscribers when events happen. Events will run asynchronously.
 */
export default class RedisEventBusService extends AbstractEventBusModuleService {
    protected readonly logger_: Logger;
    protected readonly moduleOptions_: EventBusRedisModuleOptions;
    protected readonly moduleDeclaration_: InternalModuleDeclaration;
    protected readonly eventBusRedisConnection_: Redis;
    protected queue_: Queue;
    protected bullWorker_: Worker;
    constructor({ logger, eventBusRedisConnection }: InjectedDependencies, moduleOptions: EventBusRedisModuleOptions | undefined, moduleDeclaration: InternalModuleDeclaration);
    __hooks: {
        onApplicationStart: () => Promise<void>;
        onApplicationShutdown: () => Promise<void>;
        onApplicationPrepareShutdown: () => Promise<void>;
    };
    private buildEvents;
    /**
     * Emit a single or number of events
     * @param eventsData
     * @param options
     */
    emit<T = unknown>(eventsData: Message<T> | Message<T>[], options?: Options): Promise<void>;
    private setExpire;
    private groupEvents;
    private getGroupedEvents;
    releaseGroupedEvents(eventGroupId: string): Promise<void>;
    clearGroupedEvents(eventGroupId: string): Promise<void>;
    /**
     * Handles incoming jobs.
     * @param job The job object
     * @return resolves to the results of the subscriber calls.
     */
    worker_: <T>(job: BullJob<T>) => Promise<unknown>;
}
export {};
//# sourceMappingURL=event-bus-redis.d.ts.map