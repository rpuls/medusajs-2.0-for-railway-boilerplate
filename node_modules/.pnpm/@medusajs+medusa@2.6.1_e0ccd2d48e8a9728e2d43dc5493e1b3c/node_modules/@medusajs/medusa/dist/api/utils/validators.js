"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOperatorMap = exports.createFindParams = exports.createSelectParams = exports.createLinkBody = exports.createBatchBody = exports.WithAdditionalData = void 0;
const zod_1 = require("zod");
/**
 * Wraps the original schema to a function to accept and merge
 * additional_data schema
 */
const WithAdditionalData = (originalSchema, modifyCallback) => {
    return (additionalDataValidator) => {
        let schema;
        if (!additionalDataValidator) {
            schema = originalSchema.extend({
                additional_data: zod_1.z.record(zod_1.z.unknown()).nullish(),
            });
        }
        else {
            schema = originalSchema.extend({
                additional_data: additionalDataValidator,
            });
        }
        return modifyCallback ? modifyCallback(schema) : schema;
    };
};
exports.WithAdditionalData = WithAdditionalData;
const createBatchBody = (createValidator, updateValidator, deleteValidator = zod_1.z.string()) => {
    return zod_1.z.object({
        create: zod_1.z.array(createValidator).optional(),
        update: zod_1.z.array(updateValidator).optional(),
        delete: zod_1.z.array(deleteValidator).optional(),
    });
};
exports.createBatchBody = createBatchBody;
const createLinkBody = () => {
    return zod_1.z.object({
        add: zod_1.z.array(zod_1.z.string()).optional(),
        remove: zod_1.z.array(zod_1.z.string()).optional(),
    });
};
exports.createLinkBody = createLinkBody;
const createSelectParams = () => {
    return zod_1.z.object({
        fields: zod_1.z.string().optional(),
    });
};
exports.createSelectParams = createSelectParams;
const createFindParams = ({ offset, limit, order, } = {}) => {
    const selectParams = (0, exports.createSelectParams)();
    return selectParams.merge(zod_1.z.object({
        offset: zod_1.z.preprocess((val) => {
            if (val && typeof val === "string") {
                return parseInt(val);
            }
            return val;
        }, zod_1.z
            .number()
            .optional()
            .default(offset ?? 0)),
        limit: zod_1.z.preprocess((val) => {
            if (val && typeof val === "string") {
                return parseInt(val);
            }
            return val;
        }, zod_1.z
            .number()
            .optional()
            .default(limit ?? 20)),
        order: order
            ? zod_1.z.string().optional().default(order)
            : zod_1.z.string().optional(),
    }));
};
exports.createFindParams = createFindParams;
const createOperatorMap = (type, valueParser) => {
    if (!type) {
        type = zod_1.z.string();
    }
    let simpleType = type.optional();
    if (valueParser) {
        simpleType = zod_1.z.preprocess(valueParser, type).optional();
    }
    const arrayType = zod_1.z.array(type).optional();
    const unionType = zod_1.z.union([simpleType, arrayType]).optional();
    return zod_1.z.union([
        unionType,
        zod_1.z.object({
            $eq: unionType,
            $ne: unionType,
            $in: arrayType,
            $nin: arrayType,
            $like: simpleType,
            $ilike: simpleType,
            $re: simpleType,
            $contains: simpleType,
            $gt: simpleType,
            $gte: simpleType,
            $lt: simpleType,
            $lte: simpleType,
        }),
    ]);
};
exports.createOperatorMap = createOperatorMap;
//# sourceMappingURL=validators.js.map