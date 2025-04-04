import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class ApiKey {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    /**
     * This methods retrieves a paginated list of API keys. It sends a request to the
     * [List API Keys](https://docs.medusajs.com/api/admin#api-keys_getapikeys) API route.
     *
     * @param queryParams - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of API keys.
     *
     * @example
     * To retrieve the list of API keys:
     *
     * ```ts
     * sdk.admin.apiKey.list()
     * .then(({ api_keys, count, limit, offset }) => {
     *   console.log(api_keys)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.apiKey.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ api_keys, count, limit, offset }) => {
     *   console.log(api_keys)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each API key:
     *
     * ```ts
     * sdk.admin.apiKey.list({
     *   fields: "id,*sales_channels"
     * })
     * .then(({ api_keys, count, limit, offset }) => {
     *   console.log(api_keys)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(queryParams?: HttpTypes.AdminGetApiKeysParams, headers?: ClientHeaders): Promise<HttpTypes.AdminApiKeyListResponse>;
    /**
     * This method creates an API key. It sends a request to the [Create API Key](https://docs.medusajs.com/api/admin#api-keys_postapikeys)
     * API route.
     *
     * @param body - The API key's details.
     * @param query - Configure the fields to retrieve in the created API key.
     * @param headers - Headers to pass in the request
     * @returns The created API key
     *
     * @example
     * sdk.admin.apiKey.create({
     *   title: "Development",
     *   type: "publishable"
     * })
     * .then(({ api_key }) => {
     *   console.log(api_key)
     * })
     */
    create(body: HttpTypes.AdminCreateApiKey, query?: HttpTypes.AdminGetApiKeysParams, headers?: ClientHeaders): Promise<HttpTypes.AdminApiKeyResponse>;
    /**
     * This method revokes an API key. It sends a request to the
     * [Revoke API Key](https://docs.medusajs.com/api/admin#api-keys_postapikeysidrevoke) API route.
     *
     * @param id - The API key's ID.
     * @param headers - Headers to pass in the request.
     * @returns The API key's details.
     *
     * @example
     * sdk.admin.apiKey.revoke("apk_123")
     * .then(({ api_key }) => {
     *   console.log(api_key)
     * })
     */
    revoke(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminApiKeyResponse>;
    /**
     * This method retrieves an API key's details. It sends a request to the
     * [Get API key](https://docs.medusajs.com/api/admin#api-keys_getapikeysid) API route.
     *
     * @param id - The API key's ID.
     * @param headers - Headers to pass in the request.
     * @returns The API key's details.
     *
     * @example
     * sdk.admin.apiKey.retrieve("apk_123")
     * .then(({ api_key }) => {
     *   console.log(api_key)
     * })
     */
    retrieve(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminApiKeyResponse>;
    /**
     * This method updates an API key's details. It sends a request to the
     * [Update API Key](https://docs.medusajs.com/api/admin#api-keys_postapikeysid) API route.
     *
     * @param id - The API key's ID.
     * @param body - The data to update in the API key.
     * @param query - Configure the fields to retrieve in the API key.
     * @param headers - Headers to pass in the request.
     * @returns The API key's details.
     *
     * @example
     * sdk.admin.apiKey.update("apk_123", {
     *   title: "Development"
     * })
     * .then(({ api_key }) => {
     *   console.log(api_key)
     * })
     */
    update(id: string, body: HttpTypes.AdminUpdateApiKey, query?: HttpTypes.AdminGetApiKeysParams, headers?: ClientHeaders): Promise<HttpTypes.AdminApiKeyResponse>;
    /**
     * This method deletes an API key by its ID. It sends a request to the
     * [Delete API Key](https://docs.medusajs.com/api/admin#api-keys_deleteapikeysid) API route.
     *
     * @param id - The API key's ID.
     * @param headers - Headers to pass in the request.
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.apiKey.delete("apk_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminApiKeyDeleteResponse>;
    /**
     * This method manages the sales channels associated with a publishable API key to either add
     * or remove associations. It sends a request to the [Manage Sales Channels](https://docs.medusajs.com/api/admin#api-keys_postapikeysidsaleschannels)
     * API route.
     *
     * @param id - The API key's ID.
     * @param body - The sales channels to add or remove from the API key.
     * @param headers - Headers to pass in the request.
     * @returns The API key's details.
     *
     * @example
     * sdk.admin.apiKey.batchSalesChannels("apk_123", {
     *   add: ["sc_123"],
     *   remove: ["sc_321"]
     * })
     * .then(({ api_key }) => {
     *   console.log(api_key)
     * })
     */
    batchSalesChannels(id: string, body: HttpTypes.AdminBatchLink, headers?: ClientHeaders): Promise<HttpTypes.AdminApiKeyResponse>;
}
//# sourceMappingURL=api-key.d.ts.map