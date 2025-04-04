"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapHandler = void 0;
const wrapHandler = (fn) => {
    async function wrappedHandler(req, res, next) {
        const req_ = req;
        if (req_?.errors?.length) {
            return res.status(400).json({
                errors: req_.errors,
                message: "Provided request body contains errors. Please check the data and retry the request",
            });
        }
        try {
            return await fn(req, res, next);
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    }
    if (fn.name) {
        Object.defineProperty(wrappedHandler, "name", { value: fn.name });
    }
    return wrappedHandler;
};
exports.wrapHandler = wrapHandler;
//# sourceMappingURL=wrap-handler.js.map