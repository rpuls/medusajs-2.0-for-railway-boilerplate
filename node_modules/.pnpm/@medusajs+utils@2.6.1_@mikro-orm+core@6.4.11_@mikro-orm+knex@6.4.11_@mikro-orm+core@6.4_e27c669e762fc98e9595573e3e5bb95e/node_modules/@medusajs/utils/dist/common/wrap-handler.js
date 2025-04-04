"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapHandler = void 0;
const wrapHandler = (fn) => {
    return async (req, res, next) => {
        const req_ = req;
        if (req_?.errors?.length) {
            return res.status(400).json({
                errors: req_.errors,
                message: "Provided request body contains errors. Please check the data and retry the request",
            });
        }
        try {
            return await fn(req, res);
        }
        catch (err) {
            next(err);
        }
    };
};
exports.wrapHandler = wrapHandler;
/**
 * @schema MultipleErrors
 * title: "Multiple Errors"
 * type: object
 * properties:
 *  errors:
 *    type: array
 *    description: Array of errors
 *    items:
 *      $ref: "#/components/schemas/Error"
 *  message:
 *    type: string
 *    default: "Provided request body contains errors. Please check the data and retry the request"
 */
//# sourceMappingURL=wrap-handler.js.map