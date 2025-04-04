"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanString = exports.applyAndAndOrOperators = exports.BigNumberInput = exports.AddressPayload = void 0;
exports.recursivelyNormalizeSchema = recursivelyNormalizeSchema;
const zod_1 = require("zod");
exports.AddressPayload = zod_1.z
    .object({
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    address_1: zod_1.z.string().optional(),
    address_2: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country_code: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    postal_code: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
})
    .strict();
exports.BigNumberInput = zod_1.z.union([
    zod_1.z.number(),
    zod_1.z.string(),
    zod_1.z.object({
        value: zod_1.z.string(),
        precision: zod_1.z.number(),
    }),
]);
/**
 * Return a zod object to apply the $and and $or operators on a schema.
 *
 * @param {ZodObject<any>} schema
 * @return {ZodObject<any>}
 */
const applyAndAndOrOperators = (schema) => {
    return schema.merge(zod_1.z.object({
        $and: zod_1.z.lazy(() => schema.array()).optional(),
        $or: zod_1.z.lazy(() => schema.array()).optional(),
    }));
};
exports.applyAndAndOrOperators = applyAndAndOrOperators;
/**
 * Validates that a value is a boolean when it is passed as a string.
 */
const booleanString = () => zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.string()])
    .refine((value) => {
    return ["true", "false"].includes(value.toString().toLowerCase());
})
    .transform((value) => {
    return value.toString().toLowerCase() === "true";
});
exports.booleanString = booleanString;
/**
 * Apply a transformer on a schema when the data are validated and recursively normalize the data $and and $or.
 *
 * @param {(data: Data) => NormalizedData} transform
 * @return {(data: Data) => NormalizedData}
 */
function recursivelyNormalizeSchema(transform) {
    return (data) => {
        const normalizedData = transform(data);
        Object.keys(normalizedData)
            .filter((key) => ["$and", "$or"].includes(key))
            .forEach((key) => {
            normalizedData[key] = normalizedData[key].map(transform);
        });
        return normalizedData;
    };
}
//# sourceMappingURL=common.js.map