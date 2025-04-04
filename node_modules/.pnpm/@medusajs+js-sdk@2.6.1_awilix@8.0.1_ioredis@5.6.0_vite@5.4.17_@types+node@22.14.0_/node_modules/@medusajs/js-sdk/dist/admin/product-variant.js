"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariant = void 0;
class ProductVariant {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method retrieves a paginated list of product variants. It sends a request to the
     * [List Product Variants](https://docs.medusajs.com/api/admin#product-variants_getproductvariants)
     * API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of product variants.
     *
     * @example
     * To retrieve the list of product variants:
     *
     * ```ts
     * sdk.admin.productVariant.list()
     * .then(({ variants, count, limit, offset }) => {
     *   console.log(variants)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.productVariant.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ variants, count, limit, offset }) => {
     *   console.log(variants)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each campaign:
     *
     * ```ts
     * sdk.admin.productVariant.list({
     *   fields: "id,products"
     * })
     * .then(({ variants, count, limit, offset }) => {
     *   console.log(variants)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    async list(query, headers) {
        return await this.client.fetch(`/admin/product-variants`, {
            headers,
            query,
        });
    }
}
exports.ProductVariant = ProductVariant;
//# sourceMappingURL=product-variant.js.map