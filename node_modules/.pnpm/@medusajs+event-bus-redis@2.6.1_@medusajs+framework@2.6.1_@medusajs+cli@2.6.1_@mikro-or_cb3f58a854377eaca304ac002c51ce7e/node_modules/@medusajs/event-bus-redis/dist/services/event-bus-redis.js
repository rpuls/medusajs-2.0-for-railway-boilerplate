"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const bullmq_1 = require("bullmq");
/**
 * Can keep track of multiple subscribers to different events and run the
 * subscribers when events happen. Events will run asynchronously.
 */
// eslint-disable-next-line max-len
class RedisEventBusService extends utils_1.AbstractEventBusModuleService {
    constructor({ logger, eventBusRedisConnection }, moduleOptions = {}, moduleDeclaration) {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        super(...arguments);
        this.__hooks = {
            onApplicationStart: async () => {
                await this.bullWorker_?.run();
            },
            onApplicationShutdown: async () => {
                await this.queue_.close();
                // eslint-disable-next-line max-len
                this.eventBusRedisConnection_.disconnect();
            },
            onApplicationPrepareShutdown: async () => {
                await this.bullWorker_?.close();
            },
        };
        /**
         * Handles incoming jobs.
         * @param job The job object
         * @return resolves to the results of the subscriber calls.
         */
        this.worker_ = async (job) => {
            const { data, name, opts } = job;
            const eventSubscribers = this.eventToSubscribersMap.get(name) || [];
            const wildcardSubscribers = this.eventToSubscribersMap.get("*") || [];
            const allSubscribers = eventSubscribers.concat(wildcardSubscribers);
            // Pull already completed subscribers from the job data
            const completedSubscribers = job.data.completedSubscriberIds || [];
            // Filter out already completed subscribers from the all subscribers
            const subscribersInCurrentAttempt = allSubscribers.filter((subscriber) => subscriber.id && !completedSubscribers.includes(subscriber.id));
            const currentAttempt = job.attemptsMade;
            const isRetry = currentAttempt > 1;
            const configuredAttempts = job.opts.attempts;
            const isFinalAttempt = currentAttempt === configuredAttempts;
            if (!opts.internal) {
                if (isRetry) {
                    if (isFinalAttempt) {
                        this.logger_.info(`Final retry attempt for ${name}`);
                    }
                    this.logger_.info(`Retrying ${name} which has ${eventSubscribers.length} subscribers (${subscribersInCurrentAttempt.length} of them failed)`);
                }
                else {
                    this.logger_.info(`Processing ${name} which has ${eventSubscribers.length} subscribers`);
                }
            }
            const completedSubscribersInCurrentAttempt = [];
            const subscribersResult = await Promise.all(subscribersInCurrentAttempt.map(async ({ id, subscriber }) => {
                // De-serialize the event data and metadata from a single field into the original format expected by the subscribers
                const event = {
                    name,
                    data: data.data,
                    metadata: data.metadata,
                };
                try {
                    return await subscriber(event).then((data) => {
                        // For every subscriber that completes successfully, add their id to the list of completed subscribers
                        completedSubscribersInCurrentAttempt.push(id);
                        return data;
                    });
                }
                catch (err) {
                    this.logger_?.warn(`An error occurred while processing ${name}:`);
                    this.logger_?.warn(err);
                    return err;
                }
            }));
            // If the number of completed subscribers is different from the number of subcribers to process in current attempt, some of them failed
            const didSubscribersFail = completedSubscribersInCurrentAttempt.length !==
                subscribersInCurrentAttempt.length;
            const isRetriesConfigured = configuredAttempts > 1;
            // Therefore, if retrying is configured, we try again
            const shouldRetry = didSubscribersFail && isRetriesConfigured && !isFinalAttempt;
            if (shouldRetry) {
                const updatedCompletedSubscribers = [
                    ...completedSubscribers,
                    ...completedSubscribersInCurrentAttempt,
                ];
                job.data.completedSubscriberIds = updatedCompletedSubscribers;
                await job.updateData(job.data);
                const errorMessage = `One or more subscribers of ${name} failed. Retrying...`;
                this.logger_.warn(errorMessage);
                throw Error(errorMessage);
            }
            if (didSubscribersFail && !isFinalAttempt) {
                // If retrying is not configured, we log a warning to allow server admins to recover manually
                this.logger_.warn(`One or more subscribers of ${name} failed. Retrying is not configured. Use 'attempts' option when emitting events.`);
            }
            return subscribersResult;
        };
        this.eventBusRedisConnection_ = eventBusRedisConnection;
        this.moduleOptions_ = moduleOptions;
        this.logger_ = logger;
        this.queue_ = new bullmq_1.Queue(moduleOptions.queueName ?? `events-queue`, {
            prefix: `${this.constructor.name}`,
            ...(moduleOptions.queueOptions ?? {}),
            connection: eventBusRedisConnection,
        });
        // Register our worker to handle emit calls
        if (this.isWorkerMode) {
            this.bullWorker_ = new bullmq_1.Worker(moduleOptions.queueName ?? "events-queue", this.worker_, {
                prefix: `${this.constructor.name}`,
                ...(moduleOptions.workerOptions ?? {}),
                connection: eventBusRedisConnection,
                autorun: false,
            });
        }
    }
    buildEvents(eventsData, options = {}) {
        const opts = {
            // default options
            removeOnComplete: true,
            attempts: 1,
            // global options
            ...(this.moduleOptions_.jobOptions ?? {}),
            ...options,
        };
        return eventsData.map((eventData) => {
            // We want to preserve event data + metadata. However, bullmq only allows for a single data field.
            // Therefore, upon adding jobs to the queue we will serialize the event data and metadata into a single field
            // and upon processing the job, we will deserialize it back into the original format expected by the subscribers.
            const event = {
                data: eventData.data,
                metadata: eventData.metadata,
            };
            return {
                data: event,
                name: eventData.name,
                opts: {
                    // options for event group
                    ...opts,
                    // options for a particular event
                    ...eventData.options,
                },
            };
        });
    }
    /**
     * Emit a single or number of events
     * @param eventsData
     * @param options
     */
    async emit(eventsData, options = {}) {
        let eventsDataArray = Array.isArray(eventsData) ? eventsData : [eventsData];
        const { groupedEventsTTL = 600 } = options;
        delete options.groupedEventsTTL;
        const eventsToEmit = eventsDataArray.filter((eventData) => !(0, utils_1.isPresent)(eventData.metadata?.eventGroupId));
        const eventsToGroup = eventsDataArray.filter((eventData) => (0, utils_1.isPresent)(eventData.metadata?.eventGroupId));
        const groupEventsMap = new Map();
        for (const event of eventsToGroup) {
            const groupId = event.metadata?.eventGroupId;
            const groupEvents = groupEventsMap.get(groupId) ?? [];
            groupEvents.push(event);
            groupEventsMap.set(groupId, groupEvents);
        }
        const promises = [];
        if (eventsToEmit.length) {
            const emitData = this.buildEvents(eventsToEmit, options);
            promises.push(this.queue_.addBulk(emitData));
        }
        for (const [groupId, events] of groupEventsMap.entries()) {
            if (!events?.length) {
                continue;
            }
            // Set a TTL for the key of the list that is scoped to a group
            // This will be helpful in preventing stale data from staying in redis for too long
            // in the event the module fails to cleanup events. For long running workflows, setting a much higher
            // TTL or even skipping the TTL would be required
            void this.setExpire(groupId, groupedEventsTTL);
            const eventsData = this.buildEvents(events, options);
            promises.push(this.groupEvents(groupId, eventsData));
        }
        await (0, utils_1.promiseAll)(promises);
    }
    async setExpire(eventGroupId, ttl) {
        if (!eventGroupId) {
            return;
        }
        await this.eventBusRedisConnection_.expire(`staging:${eventGroupId}`, ttl);
    }
    async groupEvents(eventGroupId, events) {
        await this.eventBusRedisConnection_.rpush(`staging:${eventGroupId}`, ...events.map((event) => JSON.stringify(event)));
    }
    async getGroupedEvents(eventGroupId) {
        return await this.eventBusRedisConnection_
            .lrange(`staging:${eventGroupId}`, 0, -1)
            .then((result) => {
            return result.map((jsonString) => JSON.parse(jsonString));
        });
    }
    async releaseGroupedEvents(eventGroupId) {
        const groupedEvents = await this.getGroupedEvents(eventGroupId);
        await this.queue_.addBulk(groupedEvents);
        await this.clearGroupedEvents(eventGroupId);
    }
    async clearGroupedEvents(eventGroupId) {
        if (!eventGroupId) {
            return;
        }
        await this.eventBusRedisConnection_.unlink(`staging:${eventGroupId}`);
    }
}
exports.default = RedisEventBusService;
//# sourceMappingURL=event-bus-redis.js.map