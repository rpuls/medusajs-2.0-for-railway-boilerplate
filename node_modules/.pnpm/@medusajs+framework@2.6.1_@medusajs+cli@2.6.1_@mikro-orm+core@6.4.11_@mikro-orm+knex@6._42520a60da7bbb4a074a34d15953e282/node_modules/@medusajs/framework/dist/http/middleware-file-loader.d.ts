import { type BodyParserConfigRoute, type MiddlewareDescriptor, type MedusaErrorHandlerFunction } from "./types";
/**
 * Exposes the API to scan a directory and load the `middleware.ts` file. This file contains
 * the configuration for certain global middlewares and core routes validators. Also, it may
 * contain custom middlewares.
 */
export declare class MiddlewareFileLoader {
    #private;
    /**
     * Scans a given directory for the "middleware.ts" or "middleware.js" files and
     * imports them for reading the registered middleware and configuration for
     * existing routes/middleware.
     */
    scanDir(sourceDir: string): Promise<void>;
    /**
     * Returns the globally registered error handler (if any)
     */
    getErrorHandler(): MedusaErrorHandlerFunction | undefined;
    /**
     * Returns a collection of registered middleware
     */
    getMiddlewares(): MiddlewareDescriptor[];
    /**
     * Returns routes that have bodyparser config on them
     */
    getBodyParserConfigRoutes(): BodyParserConfigRoute[];
}
//# sourceMappingURL=middleware-file-loader.d.ts.map