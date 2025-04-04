declare const PricePreference: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    attribute: import("@medusajs/framework/utils").TextProperty;
    value: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    is_tax_inclusive: import("@medusajs/framework/utils").BooleanProperty;
}>, "PricePreference">;
export default PricePreference;
//# sourceMappingURL=price-preference.d.ts.map