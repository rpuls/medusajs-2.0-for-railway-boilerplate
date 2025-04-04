"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndTransformBody = validateAndTransformBody;
const zod_helpers_1 = require("../../zod/zod-helpers");
function validateAndTransformBody(zodSchema) {
    return async function validateBody(req, _, next) {
        try {
            let schema;
            if (typeof zodSchema === "function") {
                schema = zodSchema(req.additionalDataValidator);
            }
            else {
                schema = zodSchema;
            }
            req.validatedBody = await (0, zod_helpers_1.zodValidator)(schema, req.body);
            next();
        }
        catch (e) {
            next(e);
        }
    };
}
//# sourceMappingURL=validate-body.js.map