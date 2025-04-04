import { z } from "zod";
export declare const ResetPasswordRequest: z.ZodObject<{
    identifier: z.ZodString;
}, "strip", z.ZodTypeAny, {
    identifier: string;
}, {
    identifier: string;
}>;
export type ResetPasswordRequestType = z.infer<typeof ResetPasswordRequest>;
//# sourceMappingURL=validators.d.ts.map