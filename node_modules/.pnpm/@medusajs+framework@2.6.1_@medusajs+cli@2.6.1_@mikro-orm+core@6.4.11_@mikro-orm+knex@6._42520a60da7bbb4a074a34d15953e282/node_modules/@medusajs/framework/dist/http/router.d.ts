import type { Express, RequestHandler } from "express";
import type { MiddlewareFunction, RouteHandler } from "./types";
export declare class ApiLoader {
    #private;
    /**
     * Wrap the original route handler implementation for
     * instrumentation.
     */
    static traceRoute?: (handler: RouteHandler, route: {
        route: string;
        method: string;
    }) => RouteHandler;
    /**
     * Wrap the original middleware handler implementation for
     * instrumentation.
     */
    static traceMiddleware?: (handler: RequestHandler | MiddlewareFunction, route: {
        route: string;
        method?: string;
    }) => RequestHandler | MiddlewareFunction;
    constructor({ app, sourceDir, baseRestrictedFields, }: {
        app: Express;
        sourceDir: string | string[];
        baseRestrictedFields?: string[];
    });
    load(): Promise<void>;
}
//# sourceMappingURL=router.d.ts.map