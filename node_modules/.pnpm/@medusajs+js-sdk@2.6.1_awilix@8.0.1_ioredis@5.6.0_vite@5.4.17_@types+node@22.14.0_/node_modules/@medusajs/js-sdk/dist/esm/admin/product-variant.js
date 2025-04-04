var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class ProductVariant {
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
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/product-variants`, {
                headers,
                query,
            });
        });
    }
}
//# sourceMappingURL=product-variant.js.map