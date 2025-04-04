"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentProvider = void 0;
class FulfillmentProvider {
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
    async list(query, headers) {
        return await this.client.fetch(`/admin/fulfillment-providers`, {
            method: "GET",
            headers,
            query,
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
    async listFulfillmentOptions(id, headers) {
        return await this.client.fetch(`/admin/fulfillment-providers/${id}/options`, {
            method: "GET",
            headers,
        });
    }
}
exports.FulfillmentProvider = FulfillmentProvider;
//# sourceMappingURL=fulfillment-provider.js.map