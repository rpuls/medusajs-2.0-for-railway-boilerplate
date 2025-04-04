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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _ApiLoader_instances, _a, _ApiLoader_app, _ApiLoader_sourceDirs, _ApiLoader_loadHttpResources, _ApiLoader_registerExpressHandler, _ApiLoader_assignRestrictedFields, _ApiLoader_createCorsOptions, _ApiLoader_applyCorsMiddleware, _ApiLoader_applyAuthMiddleware, _ApiLoader_applyBodyParserMiddleware, _ApiLoader_applyStorePublishableKeyMiddleware;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLoader = void 0;
const reporter_1 = __importDefault(require("@medusajs/cli/dist/reporter"));
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("@medusajs/utils");
const routes_loader_1 = require("./routes-loader");
const routes_finder_1 = require("./routes-finder");
const routes_sorter_1 = require("./routes-sorter");
const wrap_handler_1 = require("./utils/wrap-handler");
const middlewares_1 = require("./middlewares");
const error_handler_1 = require("./middlewares/error-handler");
const restricted_fields_1 = require("./utils/restricted-fields");
const middleware_file_loader_1 = require("./middleware-file-loader");
const bodyparser_1 = require("./middlewares/bodyparser");
const ensure_publishable_api_key_1 = require("./middlewares/ensure-publishable-api-key");
const config_1 = require("../config");
class ApiLoader {
    constructor({ app, sourceDir, baseRestrictedFields = [], }) {
        _ApiLoader_instances.add(this);
        /**
         * An express instance
         * @private
         */
        _ApiLoader_app.set(this, void 0);
        /**
         * Path from where to load the routes from
         * @private
         */
        _ApiLoader_sourceDirs.set(this, void 0);
        __classPrivateFieldSet(this, _ApiLoader_app, app, "f");
        __classPrivateFieldSet(this, _ApiLoader_sourceDirs, Array.isArray(sourceDir) ? sourceDir : [sourceDir], "f");
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_assignRestrictedFields).call(this, baseRestrictedFields ?? []);
    }
    async load() {
        const { errorHandler: sourceErrorHandler, middlewares, routes, routesFinder, bodyParserConfigRoutes, } = await __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_loadHttpResources).call(this);
        /**
         * Parse request body on all the requests and use the routes finder
         * to pick the best matching config for the given route.
         */
        const bodyParserRoutesFinder = new routes_finder_1.RoutesFinder(new routes_sorter_1.RoutesSorter(bodyParserConfigRoutes).sort([
            "static",
            "params",
            "regex",
            "wildcard",
            "global",
        ]));
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_applyBodyParserMiddleware).call(this, "/", bodyParserRoutesFinder);
        /**
         * CORS and Auth setup for admin routes
         */
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_applyCorsMiddleware).call(this, routesFinder, "/admin", "shouldAppendAdminCors", __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_createCorsOptions).call(this, config_1.configManager.config.projectConfig.http.adminCors));
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_applyAuthMiddleware).call(this, routesFinder, "/admin", "user", [
            "bearer",
            "session",
            "api-key",
        ]);
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_applyCorsMiddleware).call(this, routesFinder, "/store", "shouldAppendStoreCors", __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_createCorsOptions).call(this, config_1.configManager.config.projectConfig.http.storeCors));
        /**
         * Publishable key check, CORS and auth setup for store routes.
         */
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_applyStorePublishableKeyMiddleware).call(this, "/store");
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_applyAuthMiddleware).call(this, routesFinder, "/store", "customer", ["bearer", "session"], {
            allowUnauthenticated: true,
        });
        /**
         * Apply CORS middleware for "/auth" routes
         */
        __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_applyCorsMiddleware).call(this, routesFinder, "/auth", "shouldAppendAuthCors", __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_createCorsOptions).call(this, config_1.configManager.config.projectConfig.http.authCors));
        const collectionToSort = []
            .concat(middlewares)
            .concat(routes);
        const sortedRoutes = new routes_sorter_1.RoutesSorter(collectionToSort).sort();
        sortedRoutes.forEach((route) => {
            if ("isRoute" in route) {
                routesFinder.add(route);
            }
            __classPrivateFieldGet(this, _ApiLoader_instances, "m", _ApiLoader_registerExpressHandler).call(this, route);
        });
        /**
         * Registering error handler as the final handler
         */
        __classPrivateFieldGet(this, _ApiLoader_app, "f").use(sourceErrorHandler ?? (0, error_handler_1.errorHandler)());
    }
}
exports.ApiLoader = ApiLoader;
_a = ApiLoader, _ApiLoader_app = new WeakMap(), _ApiLoader_sourceDirs = new WeakMap(), _ApiLoader_instances = new WeakSet(), _ApiLoader_loadHttpResources = 
/**
 * Loads routes, middleware, bodyParserConfig routes, routes that have
 * opted out for Auth and CORS and the error handler.
 */
async function _ApiLoader_loadHttpResources() {
    const routesLoader = new routes_loader_1.RoutesLoader();
    const middlewareLoader = new middleware_file_loader_1.MiddlewareFileLoader();
    for (let dir of __classPrivateFieldGet(this, _ApiLoader_sourceDirs, "f")) {
        await routesLoader.scanDir(dir);
        await middlewareLoader.scanDir(dir);
    }
    return {
        routes: routesLoader.getRoutes(),
        routesFinder: new routes_finder_1.RoutesFinder(),
        middlewares: middlewareLoader.getMiddlewares(),
        errorHandler: middlewareLoader.getErrorHandler(),
        bodyParserConfigRoutes: middlewareLoader.getBodyParserConfigRoutes(),
    };
}, _ApiLoader_registerExpressHandler = function _ApiLoader_registerExpressHandler(route) {
    if ("isRoute" in route) {
        reporter_1.default.debug(`registering route ${route.method} ${route.matcher}`);
        const handler = _a.traceRoute
            ? _a.traceRoute(route.handler, {
                route: route.matcher,
                method: route.method,
            })
            : route.handler;
        __classPrivateFieldGet(this, _ApiLoader_app, "f")[route.method.toLowerCase()](route.matcher, (0, wrap_handler_1.wrapHandler)(handler));
        return;
    }
    if (!route.methods) {
        reporter_1.default.debug(`registering global middleware for ${route.matcher}`);
        const handler = _a.traceMiddleware
            ? _a.traceMiddleware(route.handler, {
                route: route.matcher,
            })
            : route.handler;
        __classPrivateFieldGet(this, _ApiLoader_app, "f").use(route.matcher, (0, wrap_handler_1.wrapHandler)(handler));
        return;
    }
    const methods = Array.isArray(route.methods)
        ? route.methods
        : [route.methods];
    methods.forEach((method) => {
        reporter_1.default.debug(`registering route middleware ${method} ${route.matcher}`);
        const handler = _a.traceMiddleware
            ? _a.traceMiddleware((0, wrap_handler_1.wrapHandler)(route.handler), {
                route: route.matcher,
                method: method,
            })
            : (0, wrap_handler_1.wrapHandler)(route.handler);
        __classPrivateFieldGet(this, _ApiLoader_app, "f")[method.toLowerCase()](route.matcher, handler);
    });
}, _ApiLoader_assignRestrictedFields = function _ApiLoader_assignRestrictedFields(baseRestrictedFields) {
    __classPrivateFieldGet(this, _ApiLoader_app, "f").use("/store", ((req, _, next) => {
        req.restrictedFields = new restricted_fields_1.RestrictedFields();
        req.restrictedFields.add(baseRestrictedFields);
        next();
    }));
    __classPrivateFieldGet(this, _ApiLoader_app, "f").use("/admin", ((req, _, next) => {
        req.restrictedFields = new restricted_fields_1.RestrictedFields();
        next();
    }));
}, _ApiLoader_createCorsOptions = function _ApiLoader_createCorsOptions(origin) {
    return {
        origin: (0, utils_1.parseCorsOrigins)(origin),
        credentials: true,
        preflightContinue: false,
    };
}, _ApiLoader_applyCorsMiddleware = function _ApiLoader_applyCorsMiddleware(routesFinder, namespace, toggleKey, corsOptions) {
    const corsFn = (0, cors_1.default)(corsOptions);
    const corsMiddleware = function corsMiddleware(req, res, next) {
        let method = req.method;
        if (req.method === "OPTIONS") {
            method = req.headers["access-control-request-method"] ?? req.method;
        }
        const path = `${namespace}${req.path}`;
        const matchingRoute = routesFinder.find(path, method);
        if (matchingRoute && matchingRoute[toggleKey] === true) {
            return corsFn(req, res, next);
        }
        reporter_1.default.debug(`Skipping CORS middleware ${req.method} ${path}`);
        return next();
    };
    __classPrivateFieldGet(this, _ApiLoader_app, "f").use(namespace, _a.traceMiddleware
        ? _a.traceMiddleware(corsMiddleware, {
            route: namespace,
        })
        : corsMiddleware);
}, _ApiLoader_applyAuthMiddleware = function _ApiLoader_applyAuthMiddleware(routesFinder, namespace, actorType, authType, options) {
    reporter_1.default.debug(`Registering auth middleware for prefix ${namespace}`);
    const originalFn = (0, middlewares_1.authenticate)(actorType, authType, options);
    const authMiddleware = function authMiddleware(req, res, next) {
        const path = `${namespace}${req.path}`;
        const matchingRoute = routesFinder.find(path, req.method);
        if (matchingRoute && matchingRoute.optedOutOfAuth) {
            reporter_1.default.debug(`Skipping auth ${req.method} ${path}`);
            return next();
        }
        reporter_1.default.debug(`Authenticating route ${req.method} ${path}`);
        return originalFn(req, res, next);
    };
    __classPrivateFieldGet(this, _ApiLoader_app, "f").use(namespace, _a.traceMiddleware
        ? _a.traceMiddleware(authMiddleware, {
            route: namespace,
        })
        : authMiddleware);
}, _ApiLoader_applyBodyParserMiddleware = function _ApiLoader_applyBodyParserMiddleware(namespace, routesFinder) {
    reporter_1.default.debug(`Registering bodyparser middleware for prefix ${namespace}`);
    __classPrivateFieldGet(this, _ApiLoader_app, "f").use(namespace, (0, bodyparser_1.createBodyParserMiddlewaresStack)(namespace, routesFinder, _a.traceMiddleware));
}, _ApiLoader_applyStorePublishableKeyMiddleware = function _ApiLoader_applyStorePublishableKeyMiddleware(namespace) {
    reporter_1.default.debug(`Registering publishable key middleware for namespace ${namespace}`);
    let middleware = _a.traceMiddleware
        ? _a.traceMiddleware(ensure_publishable_api_key_1.ensurePublishableApiKeyMiddleware, {
            route: namespace,
        })
        : ensure_publishable_api_key_1.ensurePublishableApiKeyMiddleware;
    __classPrivateFieldGet(this, _ApiLoader_app, "f").use(namespace, middleware);
};
//# sourceMappingURL=router.js.map