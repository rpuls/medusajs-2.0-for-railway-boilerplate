"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const qs_1 = __importDefault(require("qs"));
const http_1 = require("@medusajs/framework/http");
exports.default = async ({ app, container, plugins }) => {
    // This is a workaround for the issue described here: https://github.com/expressjs/express/issues/3454
    // We parse the url and get the qs to be parsed and override the query prop from the request
    app.use(function (req, res, next) {
        const parsedUrl = req.url.split("?");
        parsedUrl.shift();
        const queryParamsStr = parsedUrl.join("?");
        if (queryParamsStr) {
            req.query = qs_1.default.parse(queryParamsStr, { arrayLimit: Infinity });
        }
        next();
    });
    const sourcePaths = [];
    /**
     * Always load plugin routes before the Medusa core routes, since it
     * will allow the plugin to define routes with higher priority
     * than Medusa. Here are couple of examples.
     *
     * - Plugin registers a route called "/products/active"
     * - Medusa registers a route called "/products/:id"
     *
     * Now, if Medusa routes gets registered first, then the "/products/active"
     * route will never be resolved, because it will be handled by the
     * "/products/:id" route.
     */
    sourcePaths.push((0, path_1.join)(__dirname, "../api"), ...plugins.map((pluginDetails) => {
        return (0, path_1.join)(pluginDetails.resolve, "api");
    }));
    const { projectConfig: { http: { restrictedFields }, }, } = container.resolve("configModule");
    // TODO: Figure out why this is causing issues with test when placed inside ./api.ts
    // Adding this here temporarily
    // Test: (packages/medusa/src/api/routes/admin/currencies/update-currency.ts)
    try {
        await new http_1.ApiLoader({
            app: app,
            sourceDir: sourcePaths,
            baseRestrictedFields: restrictedFields?.store,
        }).load();
    }
    catch (err) {
        throw Error(`An error occurred while registering API Routes. Error: ${err.message}`);
    }
    return app;
};
//# sourceMappingURL=api.js.map