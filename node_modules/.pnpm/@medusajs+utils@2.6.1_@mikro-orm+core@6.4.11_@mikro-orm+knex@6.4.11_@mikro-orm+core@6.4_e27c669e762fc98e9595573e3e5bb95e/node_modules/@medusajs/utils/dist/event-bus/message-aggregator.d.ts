import { Context, EventBusTypes, IMessageAggregator, Message, MessageAggregatorFormat } from "@medusajs/types";
export declare class MessageAggregator implements IMessageAggregator {
    private messages;
    constructor();
    count(): number;
    save(msg: Message | Message[]): void;
    saveRawMessageData<T>(messageData: EventBusTypes.RawMessageFormat<T> | EventBusTypes.RawMessageFormat<T>[], { options, sharedContext, }?: {
        options?: Record<string, unknown>;
        sharedContext?: Context;
    }): void;
    getMessages(format?: MessageAggregatorFormat): {
        [group: string]: Message[];
    };
    clearMessages(): void;
    private getValueFromPath;
    private compareMessages;
}
//# sourceMappingURL=message-aggregator.d.ts.map