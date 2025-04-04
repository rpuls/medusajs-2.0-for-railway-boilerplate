import { StepExecutionContext } from "@medusajs/framework/workflows-sdk";
/**
 * The event's details.
 */
type Input = {
    /**
     * The event's name.
     */
    eventName: string;
    /**
     * Options to emit the event.
     */
    options?: Record<string, any>;
    /**
     * Metadata that the subscriber receives in the `metadata` property
     * of its first parameter.
     */
    metadata?: Record<string, any>;
    /**
     * The data payload that the subscriber receives in the `data` property
     * of its first parameter. Use this property to pass data relevant for the
     * subscriber, such as the ID of a created record.
     */
    data: ((context: StepExecutionContext) => Promise<Record<any, any>>) | Record<any, any>;
};
export declare const emitEventStepId = "emit-event-step";
/**
 * Emit an event.
 *
 * @example
 * emitEventStep({
 *   eventName: "custom.created",
 *   data: {
 *     id: "123"
 *   }
 * })
 */
export declare const emitEventStep: import("@medusajs/framework/workflows-sdk").StepFunction<Input, unknown>;
export {};
//# sourceMappingURL=emit-event.d.ts.map