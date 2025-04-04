import { Tracer as OTTracer, Span } from "@opentelemetry/api";
/**
 * Tracer creates an instrumentation scope within the application
 * code. For example: You might create a tracer for the API
 * requests, another one for the modules, one for workflows
 * and so on.
 *
 * There is no need to create a Tracer instance per HTTP
 * call.
 */
export declare class Tracer {
    #private;
    name: string;
    version?: string | undefined;
    constructor(name: string, version?: string | undefined);
    /**
     * Returns the underlying tracer from open telemetry that
     * could be used directly for certain advanced use-cases
     */
    getOTTracer(): OTTracer;
    /**
     * Trace a function call. Using this method will create a
     * child scope for the invocations within the callback.
     */
    trace<F extends (span: Span) => unknown>(name: string, callback: F): ReturnType<F>;
    /**
     * Returns the active context
     */
    getActiveContext(): import("@opentelemetry/api").Context;
    /**
     * Returns the propagation state from the current active
     * context
     */
    getPropagationState(): {
        traceparent: string;
        tracestate?: string;
    };
    /**
     * Use the existing propogation state and trace an action. This
     * will allow the newly traced action to be part of some
     * existing trace
     */
    withPropagationState(state: {
        traceparent: string;
        tracestate?: string;
    }): {
        trace: <F extends (span: Span) => unknown>(name: string, callback: F) => ReturnType<F>;
    };
}
//# sourceMappingURL=index.d.ts.map