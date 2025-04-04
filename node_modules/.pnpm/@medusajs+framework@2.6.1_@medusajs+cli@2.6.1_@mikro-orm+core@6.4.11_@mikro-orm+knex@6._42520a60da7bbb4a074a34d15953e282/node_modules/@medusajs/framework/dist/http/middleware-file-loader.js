"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MiddlewareFileLoader_instances, _MiddlewareFileLoader_errorHandler, _MiddlewareFileLoader_middleware, _MiddlewareFileLoader_bodyParserConfigRoutes, _MiddlewareFileLoader_processMiddlewareFile;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareFileLoader = void 0;
const path_1 = require("path");
const utils_1 = require("@medusajs/utils");
const logger_1 = require("../logger");
const types_1 = require("./types");
/**
 * File name that is used to indicate that the file is a middleware file
 */
const MIDDLEWARE_FILE_NAME = "middlewares";
/**
 * Exposes the API to scan a directory and load the `middleware.ts` file. This file contains
 * the configuration for certain global middlewares and core routes validators. Also, it may
 * contain custom middlewares.
 */
class MiddlewareFileLoader {
    constructor() {
        _MiddlewareFileLoader_instances.add(this);
        /**
         * Global error handler exported from the middleware file loader
         */
        _MiddlewareFileLoader_errorHandler.set(this, void 0);
        /**
         * Middleware collected manually or by scanning directories
         */
        _MiddlewareFileLoader_middleware.set(this, []
        /**
         * Route matchers on which a custom body parser config is used
         */
        );
        /**
         * Route matchers on which a custom body parser config is used
         */
        _MiddlewareFileLoader_bodyParserConfigRoutes.set(this, []
        /**
         * Processes the middleware file and returns the middleware and the
         * routes config exported by it.
         */
        );
    }
    /**
     * Scans a given directory for the "middleware.ts" or "middleware.js" files and
     * imports them for reading the registered middleware and configuration for
     * existing routes/middleware.
     */
    async scanDir(sourceDir) {
        const fs = new utils_1.FileSystem(sourceDir);
        if (await fs.exists(`${MIDDLEWARE_FILE_NAME}.ts`)) {
            await __classPrivateFieldGet(this, _MiddlewareFileLoader_instances, "m", _MiddlewareFileLoader_processMiddlewareFile).call(this, (0, path_1.join)(sourceDir, `${MIDDLEWARE_FILE_NAME}.ts`));
        }
        else if (await fs.exists(`${MIDDLEWARE_FILE_NAME}.js`)) {
            await __classPrivateFieldGet(this, _MiddlewareFileLoader_instances, "m", _MiddlewareFileLoader_processMiddlewareFile).call(this, (0, path_1.join)(sourceDir, `${MIDDLEWARE_FILE_NAME}.js`));
        }
    }
    /**
     * Returns the globally registered error handler (if any)
     */
    getErrorHandler() {
        return __classPrivateFieldGet(this, _MiddlewareFileLoader_errorHandler, "f");
    }
    /**
     * Returns a collection of registered middleware
     */
    getMiddlewares() {
        return __classPrivateFieldGet(this, _MiddlewareFileLoader_middleware, "f");
    }
    /**
     * Returns routes that have bodyparser config on them
     */
    getBodyParserConfigRoutes() {
        return __classPrivateFieldGet(this, _MiddlewareFileLoader_bodyParserConfigRoutes, "f");
    }
}
exports.MiddlewareFileLoader = MiddlewareFileLoader;
_MiddlewareFileLoader_errorHandler = new WeakMap(), _MiddlewareFileLoader_middleware = new WeakMap(), _MiddlewareFileLoader_bodyParserConfigRoutes = new WeakMap(), _MiddlewareFileLoader_instances = new WeakSet(), _MiddlewareFileLoader_processMiddlewareFile = 
/**
 * Processes the middleware file and returns the middleware and the
 * routes config exported by it.
 */
async function _MiddlewareFileLoader_processMiddlewareFile(absolutePath) {
    const middlewareExports = await (0, utils_1.dynamicImport)(absolutePath);
    const middlewareConfig = middlewareExports.default;
    if (!middlewareConfig) {
        logger_1.logger.warn(`No middleware configuration found in ${absolutePath}. Skipping middleware configuration.`);
        return;
    }
    const routes = middlewareConfig.routes;
    if (!routes || !Array.isArray(routes)) {
        logger_1.logger.warn(`Invalid default export found in ${absolutePath}. Make sure to use "defineMiddlewares" function and export its output.`);
        return;
    }
    const result = routes.reduce((result, route) => {
        if (!route.matcher) {
            throw new Error(`Middleware is missing a \`matcher\` field. The 'matcher' field is required when applying middleware. ${JSON.stringify(route, null, 2)}`);
        }
        const matcher = String(route.matcher);
        if ("bodyParser" in route && route.bodyParser !== undefined) {
            const methods = route.methods || [...types_1.HTTP_METHODS];
            logger_1.logger.debug(`using custom bodyparser config on matcher ${methods}:${route.matcher}`);
            result.bodyParserConfigRoutes.push({
                matcher: matcher,
                methods,
                config: route.bodyParser,
            });
        }
        if (route.middlewares) {
            route.middlewares.forEach((middleware) => {
                result.middleware.push({
                    handler: middleware,
                    matcher: matcher,
                    methods: route.methods,
                });
            });
        }
        return result;
    }, {
        bodyParserConfigRoutes: [],
        middleware: [],
    });
    const errorHandler = middlewareConfig.errorHandler;
    if (errorHandler) {
        __classPrivateFieldSet(this, _MiddlewareFileLoader_errorHandler, errorHandler, "f");
    }
    __classPrivateFieldSet(this, _MiddlewareFileLoader_middleware, __classPrivateFieldGet(this, _MiddlewareFileLoader_middleware, "f").concat(result.middleware), "f");
    __classPrivateFieldSet(this, _MiddlewareFileLoader_bodyParserConfigRoutes, __classPrivateFieldGet(this, _MiddlewareFileLoader_bodyParserConfigRoutes, "f").concat(result.bodyParserConfigRoutes), "f");
};
//# sourceMappingURL=middleware-file-loader.js.map