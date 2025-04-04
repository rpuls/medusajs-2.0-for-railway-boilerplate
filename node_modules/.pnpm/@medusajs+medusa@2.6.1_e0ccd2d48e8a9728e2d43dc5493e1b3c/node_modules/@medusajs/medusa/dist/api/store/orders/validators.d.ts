import { z } from "zod";
export declare const StoreGetOrderParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type StoreGetOrderParamsType = z.infer<typeof StoreGetOrderParams>;
export declare const StoreGetOrdersParamsFields: z.ZodObject<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    status: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strip", z.ZodTypeAny, {
    id?: string | string[] | undefined;
    status?: string | string[] | undefined;
}, {
    id?: string | string[] | undefined;
    status?: string | string[] | undefined;
}>;
export declare const StoreGetOrdersParams: z.ZodObject<{
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
export type StoreGetOrdersParamsType = z.infer<typeof StoreGetOrdersParams>;
export type StoreAcceptOrderTransferType = z.infer<typeof StoreAcceptOrderTransfer>;
export declare const StoreAcceptOrderTransfer: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export type StoreRequestOrderTransferType = z.infer<typeof StoreRequestOrderTransfer>;
export declare const StoreRequestOrderTransfer: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
}, {
    description?: string | undefined;
}>;
export type StoreCancelOrderTransferRequestType = z.infer<typeof StoreCancelOrderTransferRequest>;
export declare const StoreCancelOrderTransferRequest: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type StoreDeclineOrderTransferRequestType = z.infer<typeof StoreDeclineOrderTransferRequest>;
export declare const StoreDeclineOrderTransferRequest: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
//# sourceMappingURL=validators.d.ts.map