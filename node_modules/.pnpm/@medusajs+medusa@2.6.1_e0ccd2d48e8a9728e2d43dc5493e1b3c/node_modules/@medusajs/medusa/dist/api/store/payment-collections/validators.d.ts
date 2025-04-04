import { z } from "zod";
export type StoreGetPaymentCollectionParamsType = z.infer<typeof StoreGetPaymentCollectionParams>;
export declare const StoreGetPaymentCollectionParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type StoreCreatePaymentSessionType = z.infer<typeof StoreCreatePaymentSession>;
export declare const StoreCreatePaymentSession: z.ZodObject<{
    provider_id: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    provider_id: string;
    data?: Record<string, unknown> | undefined;
}, {
    provider_id: string;
    data?: Record<string, unknown> | undefined;
}>;
export type StoreCreatePaymentCollectionType = z.infer<typeof StoreCreatePaymentCollection>;
export declare const StoreCreatePaymentCollection: z.ZodObject<{
    cart_id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    cart_id: string;
}, {
    cart_id: string;
}>;
//# sourceMappingURL=validators.d.ts.map