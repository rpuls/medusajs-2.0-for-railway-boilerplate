"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBodyParserMiddlewaresStack = createBodyParserMiddlewaresStack;
const lodash_1 = require("lodash");
const reporter_1 = __importDefault(require("@medusajs/cli/dist/reporter"));
const express_1 = require("express");
/**
 * Parsers to use for parsing the HTTP request body
 */
const parsers = {
    json: (0, lodash_1.memoize)(function jsonParserMiddleware(options) {
        return (0, express_1.json)({
            limit: options?.sizeLimit,
            verify: options?.preserveRawBody
                ? (req, res, buf) => {
                    req.rawBody = buf;
                }
                : undefined,
        });
    }),
    text: (0, lodash_1.memoize)(function textParser(options) {
        return (0, express_1.text)({
            limit: options?.sizeLimit,
        });
    }),
    urlencoded: (0, lodash_1.memoize)(function urlencodedParserMiddleware(options) {
        return (0, express_1.urlencoded)({
            limit: options?.sizeLimit,
            extended: true,
        });
    }),
};
/**
 * Creates the bodyparser middlewares stack that creates custom bodyparsers
 * during an HTTP request based upon the defined config. The bodyparser
 * instances are cached for re-use.
 */
function createBodyParserMiddlewaresStack(route, routesFinder, tracer) {
    return ["json", "text", "urlencoded"].map((parser) => {
        function bodyParser(req, res, next) {
            const matchingRoute = routesFinder.find(req.path, req.method);
            const parserMiddleware = parsers[parser];
            if (!matchingRoute) {
                return parserMiddleware()(req, res, next);
            }
            if (matchingRoute.config === false) {
                reporter_1.default.debug(`skipping ${parser} bodyparser middleware ${req.method} ${req.path}`);
                return next();
            }
            reporter_1.default.debug(`using custom ${parser} bodyparser config ${req.method} ${req.path}`);
            return parserMiddleware(matchingRoute.config)(req, res, next);
        }
        Object.defineProperty(bodyParser, "name", {
            value: `${parser}BodyParser`,
        });
        return (tracer ? tracer(bodyParser, { route }) : bodyParser);
    });
}
//# sourceMappingURL=bodyparser.js.map