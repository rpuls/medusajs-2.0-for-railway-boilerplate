import { z } from "zod";
export type AdminGetPaymentCollectionParamsType = z.infer<typeof AdminGetPaymentCollectionParams>;
export declare const AdminGetPaymentCollectionParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type AdminCreatePaymentCollectionType = z.infer<typeof AdminCreatePaymentCollection>;
export declare const AdminCreatePaymentCollection: z.ZodObject<{
    order_id: z.ZodString;
    amount: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    order_id: string;
    amount: number;
}, {
    order_id: string;
    amount: number;
}>;
export type AdminMarkPaymentCollectionPaidType = z.infer<typeof AdminMarkPaymentCollectionPaid>;
export declare const AdminMarkPaymentCollectionPaid: z.ZodObject<{
    order_id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    order_id: string;
}, {
    order_id: string;
}>;
//# sourceMappingURL=validators.d.ts.map