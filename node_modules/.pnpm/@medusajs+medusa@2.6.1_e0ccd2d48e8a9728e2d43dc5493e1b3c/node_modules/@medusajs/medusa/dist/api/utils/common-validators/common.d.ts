import { z } from "zod";
export declare const AddressPayload: z.ZodObject<{
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    address_1: z.ZodOptional<z.ZodString>;
    address_2: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country_code: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postal_code: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    first_name?: string | undefined;
    last_name?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    address_1?: string | undefined;
    address_2?: string | undefined;
    city?: string | undefined;
    country_code?: string | undefined;
    province?: string | undefined;
    postal_code?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    first_name?: string | undefined;
    last_name?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    address_1?: string | undefined;
    address_2?: string | undefined;
    city?: string | undefined;
    country_code?: string | undefined;
    province?: string | undefined;
    postal_code?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const BigNumberInput: z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodObject<{
    value: z.ZodString;
    precision: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: string;
    precision: number;
}, {
    value: string;
    precision: number;
}>]>;
/**
 * Return a zod object to apply the $and and $or operators on a schema.
 *
 * @param {ZodObject<any>} schema
 * @return {ZodObject<any>}
 */
export declare const applyAndAndOrOperators: (schema: z.ZodObject<any>) => z.ZodObject<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
    $or: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}>;
/**
 * Validates that a value is a boolean when it is passed as a string.
 */
export declare const booleanString: () => z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>;
/**
 * Apply a transformer on a schema when the data are validated and recursively normalize the data $and and $or.
 *
 * @param {(data: Data) => NormalizedData} transform
 * @return {(data: Data) => NormalizedData}
 */
export declare function recursivelyNormalizeSchema<Data extends object, NormalizedData extends object>(transform: (data: Data) => NormalizedData): (data: Data) => NormalizedData;
//# sourceMappingURL=common.d.ts.map