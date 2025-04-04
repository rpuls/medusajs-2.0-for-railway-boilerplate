import { z } from "zod";
export declare const geoZoneCountrySchema: z.ZodObject<{
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
}>;
export declare const geoZoneProvinceSchema: z.ZodObject<{
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
}>;
export declare const geoZoneCitySchema: z.ZodObject<{
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
}>;
export declare const geoZoneZipSchema: z.ZodObject<{
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
}>;
//# sourceMappingURL=geo-zone.d.ts.map