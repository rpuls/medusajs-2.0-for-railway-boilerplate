import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class FulfillmentProvider {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
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
    list(query?: HttpTypes.AdminFulfillmentProviderListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminFulfillmentProviderListResponse>;
    /**
     * This method retrieves a list of fulfillment options for a given fulfillment provider. It sends a request to the
     * [List Fulfillment Options](https://docs.medusajs.com/api/admin#fulfillment-providers_getfulfillmentprovideroptions)
     * API route.
     *
     * @param id - The ID of the fulfillment provider.
     * @param headers - Headers to pass in the request.
     * @returns The list of fulfillment options.
     */
    listFulfillmentOptions(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminFulfillmentProviderOptionsListResponse>;
}
//# sourceMappingURL=fulfillment-provider.d.ts.map