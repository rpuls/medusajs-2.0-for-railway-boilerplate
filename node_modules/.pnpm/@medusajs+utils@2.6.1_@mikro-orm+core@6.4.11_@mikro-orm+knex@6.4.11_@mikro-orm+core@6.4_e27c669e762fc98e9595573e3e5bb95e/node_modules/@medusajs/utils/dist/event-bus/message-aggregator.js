"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageAggregator = void 0;
const build_event_messages_1 = require("./build-event-messages");
class MessageAggregator {
    constructor() {
        this.messages = [];
    }
    count() {
        return this.messages.length;
    }
    save(msg) {
        const messages = Array.isArray(msg) ? msg : [msg];
        if (messages.length === 0) {
            return;
        }
        this.messages.push(...messages);
    }
    saveRawMessageData(messageData, { options, sharedContext, } = {}) {
        const messages = Array.isArray(messageData) ? messageData : [messageData];
        const composedMessages = messages.map((message) => {
            return (0, build_event_messages_1.composeMessage)(message.eventName, {
                data: message.data,
                source: message.source,
                object: message.object,
                action: message.action,
                options,
                context: sharedContext,
            });
        });
        this.save(composedMessages);
    }
    getMessages(format = {}) {
        const { groupBy, sortBy } = format ?? {};
        if (sortBy) {
            this.messages.sort((a, b) => this.compareMessages(a, b, sortBy));
        }
        let messages = {
            default: [...this.messages],
        };
        if (groupBy) {
            messages = this.messages.reduce((acc, msg) => {
                const key = groupBy
                    .map((field) => this.getValueFromPath(msg, field))
                    .join("-");
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(msg);
                return acc;
            }, {});
        }
        if (format.internal) {
            Object.values(messages).forEach((group) => {
                group.forEach((msg) => {
                    msg.options = msg.options ?? {};
                    msg.options.internal = format.internal;
                });
            });
        }
        return messages;
    }
    clearMessages() {
        // Ensure no references are left over in case something rely on messages
        this.messages.length = 0;
    }
    getValueFromPath(obj, path) {
        const keys = path.split(".");
        return keys.reduce((acc, key) => {
            if (acc === undefined)
                return undefined;
            return acc[key];
        }, obj);
    }
    compareMessages(a, b, sortBy) {
        for (const key of Object.keys(sortBy)) {
            const orderCriteria = sortBy[key];
            const valueA = this.getValueFromPath(a, key);
            const valueB = this.getValueFromPath(b, key);
            // User defined order
            if (Array.isArray(orderCriteria)) {
                const indexA = orderCriteria.indexOf(valueA);
                const indexB = orderCriteria.indexOf(valueB);
                if (indexA === indexB) {
                    continue;
                }
                else if (indexA === -1) {
                    return 1;
                }
                else if (indexB === -1) {
                    return -1;
                }
                else {
                    return indexA - indexB;
                }
            }
            else {
                // Ascending or descending order
                let orderMultiplier = 1;
                if (orderCriteria === "desc" || orderCriteria === -1) {
                    orderMultiplier = -1;
                }
                if (valueA === valueB) {
                    continue;
                }
                else if (valueA < valueB) {
                    return -1 * orderMultiplier;
                }
                else {
                    return 1 * orderMultiplier;
                }
            }
        }
        return 0;
    }
}
exports.MessageAggregator = MessageAggregator;
//# sourceMappingURL=message-aggregator.js.map