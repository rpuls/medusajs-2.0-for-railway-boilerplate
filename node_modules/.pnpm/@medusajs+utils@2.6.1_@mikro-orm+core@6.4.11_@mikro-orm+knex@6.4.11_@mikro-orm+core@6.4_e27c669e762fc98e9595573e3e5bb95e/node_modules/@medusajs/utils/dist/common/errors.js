"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedusaError = exports.MedusaErrorCodes = exports.MedusaErrorTypes = void 0;
/**
 * @typedef MedusaErrorType
 *
 */
exports.MedusaErrorTypes = {
    /** Errors stemming from the database */
    DB_ERROR: "database_error",
    DUPLICATE_ERROR: "duplicate_error",
    INVALID_ARGUMENT: "invalid_argument",
    INVALID_DATA: "invalid_data",
    UNAUTHORIZED: "unauthorized",
    NOT_FOUND: "not_found",
    NOT_ALLOWED: "not_allowed",
    UNEXPECTED_STATE: "unexpected_state",
    CONFLICT: "conflict",
    UNKNOWN_MODULES: "unknown_modules",
    PAYMENT_AUTHORIZATION_ERROR: "payment_authorization_error",
    PAYMENT_REQUIRES_MORE_ERROR: "payment_requires_more_error",
};
exports.MedusaErrorCodes = {
    INSUFFICIENT_INVENTORY: "insufficient_inventory",
    CART_INCOMPATIBLE_STATE: "cart_incompatible_state",
    UNKNOWN_MODULES: "unknown_modules",
};
/**
 * Standardized error to be used across Medusa project.
 * @extends Error
 */
class MedusaError extends Error {
    /**
     * Creates a standardized error to be used across Medusa project.
     * @param {string} type - type of error
     * @param {string} message - message to go along with error
     * @param {string} code - code of error
     * @param {Array} params - params
     */
    constructor(type, message, code, ...params) {
        super(...params);
        this.__isMedusaError = true;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MedusaError);
        }
        this.type = type;
        this.code = code;
        this.message = message;
        this.date = new Date();
    }
    /**
     * Checks the object for the MedusaError type.
     */
    static isMedusaError(error) {
        return !!error.__isMedusaError;
    }
}
exports.MedusaError = MedusaError;
MedusaError.Types = exports.MedusaErrorTypes;
MedusaError.Codes = exports.MedusaErrorCodes;
//# sourceMappingURL=errors.js.map