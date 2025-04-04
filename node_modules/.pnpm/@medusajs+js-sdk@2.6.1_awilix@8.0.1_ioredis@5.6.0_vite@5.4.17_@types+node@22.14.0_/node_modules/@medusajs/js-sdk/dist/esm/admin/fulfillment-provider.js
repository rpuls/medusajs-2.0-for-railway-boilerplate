var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class FulfillmentProvider {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method retrieves a paginated list of fulfillment providers. It sends a request to the
     * [List Fulfillment Providers](https://docs.medusajs.com/api/admin#fulfillment-providers_getfulfillmentproviders)
     * API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of providers.
     *
     * @example
     * To retrieve the list of fulfillment providers:
     *
     * ```ts
     * sdk.admin.fulfillmentProvider.list()
     * .then(({ fulfillment_providers, count, limit, offset }) => {
     *   console.log(fulfillment_providers)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.fulfillmentProvider.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ fulfillment_providers, count, limit, offset }) => {
     *   console.log(fulfillment_providers)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each fulfillment provider:
     *
     * ```ts
     * sdk.admin.fulfillmentProvider.list({
     *   fields: "id"
     * })
     * .then(({ fulfillment_providers, count, limit, offset }) => {
     *   console.log(fulfillment_providers)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/fulfillment-providers`, {
                method: "GET",
                headers,
                query,
            });
        });
    }
    /**
     * This method retrieves a list of fulfillment options for a given fulfillment provider. It sends a request to the
     * [List Fulfillment Options](https://docs.medusajs.com/api/admin#fulfillment-providers_getfulfillmentprovideroptions)
     * API route.
     *
     * @param id - The ID of the fulfillment provider.
     * @param headers - Headers to pass in the request.
     * @returns The list of fulfillment options.
     */
    listFulfillmentOptions(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/fulfillment-providers/${id}/options`, {
                method: "GET",
                headers,
            });
        });
    }
}
//# sourceMappingURL=fulfillment-provider.js.map