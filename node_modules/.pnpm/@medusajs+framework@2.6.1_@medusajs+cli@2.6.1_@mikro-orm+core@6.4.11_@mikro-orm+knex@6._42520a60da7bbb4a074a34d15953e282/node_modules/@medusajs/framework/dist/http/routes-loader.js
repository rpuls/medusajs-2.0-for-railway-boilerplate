"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RoutesLoader_instances, _RoutesLoader_routes, _RoutesLoader_createRoutePath, _RoutesLoader_getRoutesForFile;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesLoader = void 0;
const utils_1 = require("@medusajs/utils");
const path_1 = require("path");
const logger_1 = require("../logger");
const types_1 = require("./types");
/**
 * File name that is used to indicate that the file is a route file
 */
const ROUTE_NAME = "route";
/**
 * Flag that developers can export from their route files to indicate
 * whether or not the routes from this file should be authenticated.
 */
const AUTHTHENTICATION_FLAG = "AUTHENTICATE";
/**
 * Flag that developers can export from their route files to indicate
 * whether or not the routes from this file should implement CORS
 * policy.
 */
const CORS_FLAG = "CORS";
/**
 * The matcher to use to convert the dynamic params from the filesystem
 * identifier to the express identifier.
 *
 * We capture all words under opening and closing brackets `[]` and mark
 * it as a param via `:`.
 */
const PARAM_SEGMENT_MATCHER = /\[(\w+)\]/;
/**
 * Regexes to use to identify if a route is prefixed
 * with "/admin", "/store", or "/auth".
 */
const ADMIN_ROUTE_MATCH = /(\/admin$|\/admin\/)/;
const STORE_ROUTE_MATCH = /(\/store$|\/store\/)/;
const AUTH_ROUTE_MATCH = /(\/auth$|\/auth\/)/;
/**
 * Exposes to API to register routes manually or by scanning the filesystem from a
 * source directory.
 *
 * In case of duplicates routes, the route registered afterwards will override the
 * one registered first.
 */
class RoutesLoader {
    constructor() {
        _RoutesLoader_instances.add(this);
        /**
         * Routes collected manually or by scanning directories
         */
        _RoutesLoader_routes.set(this, {}
        /**
         * Creates the route path from its relative file path.
         */
        );
    }
    /**
     * Scans a given directory and loads all routes from it. You can access the loaded
     * routes via "getRoutes" method
     */
    async scanDir(sourceDir) {
        const entries = await (0, utils_1.readDirRecursive)(sourceDir, {
            ignoreMissing: true,
        });
        await Promise.all(entries
            .filter((entry) => {
            if (entry.isDirectory()) {
                return false;
            }
            const { name, ext } = (0, path_1.parse)(entry.name);
            if (name === ROUTE_NAME && [".js", ".ts"].includes(ext)) {
                const routeFilePathSegment = (0, path_1.join)(entry.path, entry.name)
                    .replace(sourceDir, "")
                    .split(path_1.sep);
                return !routeFilePathSegment.some((segment) => segment.startsWith("_"));
            }
            return false;
        })
            .map(async (entry) => {
            const absolutePath = (0, path_1.join)(entry.path, entry.name);
            const relativePath = absolutePath.replace(sourceDir, "");
            const route = __classPrivateFieldGet(this, _RoutesLoader_instances, "m", _RoutesLoader_createRoutePath).call(this, relativePath);
            const routes = await __classPrivateFieldGet(this, _RoutesLoader_instances, "m", _RoutesLoader_getRoutesForFile).call(this, route, absolutePath);
            routes.forEach((routeConfig) => {
                this.registerRoute({
                    absolutePath,
                    relativePath,
                    ...routeConfig,
                });
            });
        }));
    }
    /**
     * Register a route
     */
    registerRoute(route) {
        __classPrivateFieldGet(this, _RoutesLoader_routes, "f")[route.matcher] = __classPrivateFieldGet(this, _RoutesLoader_routes, "f")[route.matcher] ?? {};
        const trackedRoute = __classPrivateFieldGet(this, _RoutesLoader_routes, "f")[route.matcher];
        trackedRoute[route.method] = route;
    }
    /**
     * Register one or more routes
     */
    registerRoutes(routes) {
        routes.forEach((route) => this.registerRoute(route));
    }
    /**
     * Returns an array of routes scanned by the routes loader or registered
     * manually.
     */
    getRoutes() {
        return Object.keys(__classPrivateFieldGet(this, _RoutesLoader_routes, "f")).reduce((result, routePattern) => {
            const methodsRoutes = __classPrivateFieldGet(this, _RoutesLoader_routes, "f")[routePattern];
            Object.keys(methodsRoutes).forEach((method) => {
                const route = methodsRoutes[method];
                result.push(route);
            });
            return result;
        }, []);
    }
}
exports.RoutesLoader = RoutesLoader;
_RoutesLoader_routes = new WeakMap(), _RoutesLoader_instances = new WeakSet(), _RoutesLoader_createRoutePath = function _RoutesLoader_createRoutePath(relativePath) {
    const segments = relativePath.replace(/route(\.js|\.ts)$/, "").split(path_1.sep);
    const params = {};
    return `/${segments
        .filter((segment) => !!segment)
        .map((segment) => {
        if (segment.startsWith("[")) {
            segment = segment.replace(PARAM_SEGMENT_MATCHER, (_, group) => {
                if (params[group]) {
                    logger_1.logger.debug(`Duplicate parameters found in route ${relativePath} (${group})`);
                    throw new Error(`Duplicate parameters found in route ${relativePath} (${group}). Make sure that all parameters are unique.`);
                }
                params[group] = true;
                return `:${group}`;
            });
        }
        return segment;
    })
        .join("/")}`;
}, _RoutesLoader_getRoutesForFile = 
/**
 * Returns the route config by exporting the route file and parsing
 * its exports
 */
async function _RoutesLoader_getRoutesForFile(routePath, absolutePath) {
    const routeExports = await (0, utils_1.dynamicImport)(absolutePath);
    /**
     * Find the route type based upon its prefix.
     */
    const routeType = ADMIN_ROUTE_MATCH.test(routePath)
        ? "admin"
        : STORE_ROUTE_MATCH.test(routePath)
            ? "store"
            : AUTH_ROUTE_MATCH.test(routePath)
                ? "auth"
                : undefined;
    /**
     * Check if the route file has decided to opt-out of authentication
     */
    const shouldAuthenticate = AUTHTHENTICATION_FLAG in routeExports
        ? !!routeExports[AUTHTHENTICATION_FLAG]
        : true;
    /**
     * Check if the route file has decided to opt-out of CORS
     */
    const shouldApplyCors = CORS_FLAG in routeExports ? !!routeExports[CORS_FLAG] : true;
    /**
     * Loop over all the exports and collect functions that are exported
     * with names after HTTP methods.
     */
    return Object.keys(routeExports)
        .filter((key) => {
        if (typeof routeExports[key] !== "function") {
            return false;
        }
        if (!types_1.HTTP_METHODS.includes(key)) {
            logger_1.logger.debug(`Skipping handler ${key} in ${absolutePath}. Invalid HTTP method: ${key}.`);
            return false;
        }
        return true;
    })
        .map((key) => {
        return {
            isRoute: true,
            matcher: routePath,
            method: key,
            handler: routeExports[key],
            optedOutOfAuth: !shouldAuthenticate,
            shouldAppendAdminCors: shouldApplyCors && routeType === "admin",
            shouldAppendAuthCors: shouldApplyCors && routeType === "auth",
            shouldAppendStoreCors: shouldApplyCors && routeType === "store",
        };
    });
};
//# sourceMappingURL=routes-loader.js.map