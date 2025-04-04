"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBLISHABLE_KEY_HEADER = exports.ApiKeyType = void 0;
/**
 * @enum
 *
 * The API key's type.
 */
var ApiKeyType;
(function (ApiKeyType) {
    /**
     * Publishable key that is tied to eg. a sales channel
     */
    ApiKeyType["PUBLISHABLE"] = "publishable";
    /**
     * Secret key that allows access to the admin API
     */
    ApiKeyType["SECRET"] = "secret";
})(ApiKeyType || (exports.ApiKeyType = ApiKeyType = {}));
exports.PUBLISHABLE_KEY_HEADER = "x-publishable-api-key";
//# sourceMappingURL=api-key-type.js.map