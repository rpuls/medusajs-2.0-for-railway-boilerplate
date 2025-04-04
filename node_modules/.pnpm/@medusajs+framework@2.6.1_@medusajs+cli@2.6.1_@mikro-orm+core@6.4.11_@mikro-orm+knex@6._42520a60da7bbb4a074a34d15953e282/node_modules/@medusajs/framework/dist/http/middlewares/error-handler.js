"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const utils_1 = require("@medusajs/utils");
const exception_formatter_1 = require("./exception-formatter");
const QUERY_RUNNER_RELEASED = "QueryRunnerAlreadyReleasedError";
const TRANSACTION_STARTED = "TransactionAlreadyStartedError";
const TRANSACTION_NOT_STARTED = "TransactionNotStartedError";
const API_ERROR = "api_error";
const INVALID_REQUEST_ERROR = "invalid_request_error";
const INVALID_STATE_ERROR = "invalid_state_error";
function errorHandler() {
    return function coreErrorHandler(err, req, res, _) {
        const logger = req.scope.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
        err = (0, exception_formatter_1.formatException)(err);
        logger.error(err);
        const errorType = err.type || err.name;
        const errObj = {
            code: err.code,
            type: err.type,
            message: err.message,
        };
        let statusCode = 500;
        switch (errorType) {
            case QUERY_RUNNER_RELEASED:
            case TRANSACTION_STARTED:
            case TRANSACTION_NOT_STARTED:
            case utils_1.MedusaError.Types.CONFLICT:
                statusCode = 409;
                errObj.code = INVALID_STATE_ERROR;
                errObj.message =
                    "The request conflicted with another request. You may retry the request with the provided Idempotency-Key.";
                break;
            case utils_1.MedusaError.Types.UNAUTHORIZED:
                statusCode = 401;
                break;
            case utils_1.MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR:
                statusCode = 422;
                break;
            case utils_1.MedusaError.Types.DUPLICATE_ERROR:
                statusCode = 422;
                errObj.code = INVALID_REQUEST_ERROR;
                break;
            case utils_1.MedusaError.Types.NOT_ALLOWED:
            case utils_1.MedusaError.Types.INVALID_DATA:
                statusCode = 400;
                break;
            case utils_1.MedusaError.Types.NOT_FOUND:
                statusCode = 404;
                break;
            case utils_1.MedusaError.Types.DB_ERROR:
                statusCode = 500;
                errObj.code = API_ERROR;
                break;
            case utils_1.MedusaError.Types.UNEXPECTED_STATE:
            case utils_1.MedusaError.Types.INVALID_ARGUMENT:
                break;
            default:
                errObj.code = "unknown_error";
                errObj.message = "An unknown error occurred.";
                errObj.type = "unknown_error";
                break;
        }
        res.status(statusCode).json(errObj);
    };
}
/**
 * @schema Error
 * title: "Response Error"
 * type: object
 * properties:
 *  code:
 *    type: string
 *    description: A slug code to indicate the type of the error.
 *    enum: [invalid_state_error, invalid_request_error, api_error, unknown_error]
 *  message:
 *    type: string
 *    description: Description of the error that occurred.
 *    example: "first_name must be a string"
 *  type:
 *    type: string
 *    description: A slug indicating the type of the error.
 *    enum: [QueryRunnerAlreadyReleasedError, TransactionAlreadyStartedError, TransactionNotStartedError, conflict, unauthorized, payment_authorization_error, duplicate_error, not_allowed, invalid_data, not_found, database_error, unexpected_state, invalid_argument, unknown_error]
 */
//# sourceMappingURL=error-handler.js.map