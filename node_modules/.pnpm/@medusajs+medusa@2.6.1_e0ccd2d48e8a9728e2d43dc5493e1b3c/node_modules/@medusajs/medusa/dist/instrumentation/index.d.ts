import type { SpanExporter } from "@opentelemetry/sdk-trace-node";
import type { NodeSDKConfiguration } from "@opentelemetry/sdk-node";
/**
 * Instrument the first touch point of the HTTP layer to report traces to
 * OpenTelemetry
 */
export declare function instrumentHttpLayer(): void;
/**
 * Instrument the queries made using the remote query
 */
export declare function instrumentRemoteQuery(): void;
/**
 * Instrument the workflows and steps execution
 */
export declare function instrumentWorkflows(): void;
/**
 * A helper function to configure the OpenTelemetry SDK with some defaults.
 * For better/more control, please configure the SDK manually.
 *
 * You will have to install the following packages within your app for
 * telemetry to work
 *
 * - @opentelemetry/sdk-node
 * - @opentelemetry/resources
 * - @opentelemetry/sdk-trace-node
 * - @opentelemetry/instrumentation-pg
 * - @opentelemetry/instrumentation
 */
export declare function registerOtel(options: Partial<NodeSDKConfiguration> & {
    serviceName: string;
    exporter?: SpanExporter;
    instrument?: Partial<{
        http: boolean;
        query: boolean;
        workflows: boolean;
        db: boolean;
    }>;
}): any;
//# sourceMappingURL=index.d.ts.map