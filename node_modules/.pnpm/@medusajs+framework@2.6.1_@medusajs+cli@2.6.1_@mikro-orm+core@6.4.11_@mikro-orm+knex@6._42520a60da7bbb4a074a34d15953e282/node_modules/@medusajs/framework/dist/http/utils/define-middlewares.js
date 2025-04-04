"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineMiddlewares = defineMiddlewares;
const zod_1 = __importDefault(require("zod"));
/**
 * A helper function to configure the routes by defining custom middleware,
 * bodyparser config and validators to be merged with the pre-existing
 * route validators.
 */
function defineMiddlewares(config) {
    const routes = Array.isArray(config) ? config : config.routes || [];
    const errorHandler = Array.isArray(config) ? undefined : config.errorHandler;
    return {
        errorHandler,
        routes: routes.map((route) => {
            let { middlewares, method, methods, additionalDataValidator, ...rest } = route;
            const customMiddleware = [];
            /**
             * Define a custom validator when a zod schema is provided via
             * "additionalDataValidator" property
             */
            if (additionalDataValidator) {
                customMiddleware.push((req, _, next) => {
                    req.additionalDataValidator = zod_1.default
                        .object(additionalDataValidator)
                        .nullish();
                    next();
                });
            }
            if (!methods) {
                methods = Array.isArray(method) ? method : method ? [method] : method;
            }
            return {
                ...rest,
                methods,
                middlewares: customMiddleware.concat(middlewares || []),
            };
        }),
    };
}
//# sourceMappingURL=define-middlewares.js.map