"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventBusService {
    async emit(data, options) { }
    subscribe(event, subscriber) {
        return this;
    }
    unsubscribe(event, subscriber, context) {
        return this;
    }
    releaseGroupedEvents(eventGroupId) {
        return Promise.resolve();
    }
    clearGroupedEvents(eventGroupId) {
        return Promise.resolve();
    }
}
exports.default = EventBusService;
//# sourceMappingURL=mock-event-bus-service.js.map