import { z } from "zod";
export declare const AdminFulfillmentParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type AdminCreateFulfillmentType = z.infer<typeof AdminCreateFulfillment>;
export declare const AdminCreateFulfillment: z.ZodObject<{
    location_id: z.ZodString;
    provider_id: z.ZodString;
    delivery_address: z.ZodObject<{
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
    items: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        sku: z.ZodString;
        quantity: z.ZodNumber;
        barcode: z.ZodString;
        line_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        inventory_item_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        quantity: number;
        sku: string;
        barcode: string;
        line_item_id?: string | null | undefined;
        inventory_item_id?: string | null | undefined;
    }, {
        title: string;
        quantity: number;
        sku: string;
        barcode: string;
        line_item_id?: string | null | undefined;
        inventory_item_id?: string | null | undefined;
    }>, "many">;
    labels: z.ZodArray<z.ZodObject<{
        tracking_number: z.ZodString;
        tracking_url: z.ZodString;
        label_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }, {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }>, "many">;
    order_id: z.ZodString;
    shipping_option_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    data: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    packed_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    shipped_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    delivered_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    canceled_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    data: Record<string, unknown> | null;
    items: {
        title: string;
        quantity: number;
        sku: string;
        barcode: string;
        line_item_id?: string | null | undefined;
        inventory_item_id?: string | null | undefined;
    }[];
    metadata: Record<string, unknown> | null;
    location_id: string;
    provider_id: string;
    delivery_address: {
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
    };
    labels: {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }[];
    order_id: string;
    shipping_option_id?: string | null | undefined;
    packed_at?: Date | null | undefined;
    shipped_at?: Date | null | undefined;
    delivered_at?: Date | null | undefined;
    canceled_at?: Date | null | undefined;
}, {
    data: Record<string, unknown> | null;
    items: {
        title: string;
        quantity: number;
        sku: string;
        barcode: string;
        line_item_id?: string | null | undefined;
        inventory_item_id?: string | null | undefined;
    }[];
    metadata: Record<string, unknown> | null;
    location_id: string;
    provider_id: string;
    delivery_address: {
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
    };
    labels: {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }[];
    order_id: string;
    shipping_option_id?: string | null | undefined;
    packed_at?: Date | null | undefined;
    shipped_at?: Date | null | undefined;
    delivered_at?: Date | null | undefined;
    canceled_at?: Date | null | undefined;
}>;
export type AdminCreateShipmentType = z.infer<typeof AdminCreateShipment>;
export declare const AdminCreateShipment: z.ZodObject<{
    labels: z.ZodArray<z.ZodObject<{
        tracking_number: z.ZodString;
        tracking_url: z.ZodString;
        label_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }, {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    labels: {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }[];
}, {
    labels: {
        tracking_number: string;
        tracking_url: string;
        label_url: string;
    }[];
}>;
//# sourceMappingURL=validators.d.ts.map