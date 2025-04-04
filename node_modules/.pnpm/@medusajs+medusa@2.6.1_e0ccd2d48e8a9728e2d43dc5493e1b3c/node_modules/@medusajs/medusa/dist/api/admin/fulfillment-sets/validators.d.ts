import { z } from "zod";
export declare const AdminServiceZonesParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type AdminServiceZonesParamsType = z.infer<typeof AdminServiceZonesParams>;
export declare const AdminCreateFulfillmentSetServiceZonesSchema: z.ZodObject<{
    name: z.ZodString;
    geo_zones: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        country_code: z.ZodString;
        type: z.ZodLiteral<"country">;
    }, "strip", z.ZodTypeAny, {
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    }, {
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    }>, z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        country_code: z.ZodString;
        type: z.ZodLiteral<"province">;
        province_code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    }, {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    }>, z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        country_code: z.ZodString;
        type: z.ZodLiteral<"city">;
        province_code: z.ZodString;
        city: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    }, {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    }>, z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        country_code: z.ZodString;
        type: z.ZodLiteral<"zip">;
        province_code: z.ZodString;
        city: z.ZodString;
        postal_expression: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
    }, {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
    }>]>, "many">>;
}, "strict", z.ZodTypeAny, {
    name: string;
    geo_zones?: ({
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    } | {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    } | {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    } | {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
    })[] | undefined;
}, {
    name: string;
    geo_zones?: ({
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    } | {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    } | {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
    } | {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
    })[] | undefined;
}>;
export declare const AdminUpdateFulfillmentSetServiceZonesSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    geo_zones: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"country">;
        country_code: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }, {
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }>, z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"province">;
        country_code: z.ZodString;
        province_code: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }, {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }>, z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"city">;
        city: z.ZodString;
        country_code: z.ZodString;
        province_code: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }, {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }>, z.ZodObject<{
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"zip">;
        city: z.ZodString;
        country_code: z.ZodString;
        province_code: z.ZodString;
        postal_expression: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }, {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    }>]>, "many">>;
}, "strict", z.ZodTypeAny, {
    name?: string | null | undefined;
    geo_zones?: ({
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    } | {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    } | {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    } | {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    })[] | undefined;
}, {
    name?: string | null | undefined;
    geo_zones?: ({
        type: "country";
        country_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    } | {
        type: "province";
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    } | {
        type: "city";
        city: string;
        country_code: string;
        province_code: string;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    } | {
        type: "zip";
        city: string;
        country_code: string;
        province_code: string;
        postal_expression: Record<string, unknown>;
        metadata?: Record<string, unknown> | null | undefined;
        id?: string | undefined;
    })[] | undefined;
}>;
export declare const AdminFulfillmentSetParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type AdminCreateFulfillmentSetServiceZonesType = z.infer<typeof AdminCreateFulfillmentSetServiceZonesSchema>;
export type AdminUpdateFulfillmentSetServiceZonesType = z.infer<typeof AdminUpdateFulfillmentSetServiceZonesSchema>;
export type AdminFulfillmentSetParamsType = z.infer<typeof AdminFulfillmentSetParams>;
//# sourceMappingURL=validators.d.ts.map