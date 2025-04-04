"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractEventBusModuleService = void 0;
const ulid_1 = require("ulid");
class AbstractEventBusModuleService {
    get eventToSubscribersMap() {
        return this.eventToSubscribersMap_;
    }
    constructor(cradle, moduleOptions = {}, moduleDeclaration) {
        this.isWorkerMode = true;
        this.eventToSubscribersMap_ = new Map();
        this.isWorkerMode = moduleDeclaration.worker_mode !== "server";
    }
    storeSubscribers({ event, subscriberId, subscriber, }) {
        const newSubscriberDescriptor = { subscriber, id: subscriberId };
        const existingSubscribers = this.eventToSubscribersMap_.get(event) ?? [];
        const subscriberAlreadyExists = existingSubscribers.find((sub) => sub.id === subscriberId);
        if (subscriberAlreadyExists) {
            throw Error(`Subscriber with id ${subscriberId} already exists`);
        }
        this.eventToSubscribersMap_.set(event, [
            ...existingSubscribers,
            newSubscriberDescriptor,
        ]);
    }
    subscribe(eventName, subscriber, context) {
        if (!this.isWorkerMode) {
            return this;
        }
        if (typeof subscriber !== `function`) {
            throw new Error("Subscriber must be a function");
        }
        /**
         * If context is provided, we use the subscriberId from it
         * otherwise we generate a random using a ulid
         */
        const event = eventName.toString();
        const subscriberId = context?.subscriberId ?? `${event}-${(0, ulid_1.ulid)()}`;
        subscriber.subscriberId = subscriberId;
        this.storeSubscribers({
            event,
            subscriberId,
            subscriber,
        });
        return this;
    }
    unsubscribe(eventName, subscriber, context) {
        if (!this.isWorkerMode) {
            return this;
        }
        const existingSubscribers = this.eventToSubscribersMap_.get(eventName);
        const subscriberId = context?.subscriberId ?? subscriber.subscriberId;
        if (existingSubscribers?.length) {
            const subIndex = existingSubscribers?.findIndex((sub) => sub.id === subscriberId);
            if (subIndex !== -1) {
                this.eventToSubscribersMap_
                    .get(eventName)
                    ?.splice(subIndex, 1);
            }
        }
        return this;
    }
}
exports.AbstractEventBusModuleService = AbstractEventBusModuleService;
__exportStar(require("./build-event-messages"), exports);
__exportStar(require("./common-events"), exports);
__exportStar(require("./message-aggregator"), exports);
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map