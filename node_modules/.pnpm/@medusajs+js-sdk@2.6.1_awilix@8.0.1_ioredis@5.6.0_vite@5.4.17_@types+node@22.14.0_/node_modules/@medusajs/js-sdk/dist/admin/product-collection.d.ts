import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class ProductCollection {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    /**
     * This method creates a product collection. It sends a request to the
     * [Create Collection](https://docs.medusajs.com/api/admin#collections_postcollections)
     * API route.
     *
     * @param body - The details of the product collection to create.
     * @param query - Configure the fields to retrieve in the product collection.
     * @param headers - Headers to pass in the request
     * @returns The product collection's details.
     *
     * @example
     * sdk.admin.productCollection.create({
     *   title: "Summer Collection"
     * })
     * .then(({ collection }) => {
     *   console.log(collection)
     * })
     */
    create(body: HttpTypes.AdminCreateCollection, query?: HttpTypes.AdminCollectionParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCollectionResponse>;
    /**
     * This method updates a collection. It sends a request to the
     * [Update Collection](https://docs.medusajs.com/api/admin#collections_postcollectionsid)
     * API route.
     *
     * @param id - The ID of the collection.
     * @param body - The data to update in the collection.
     * @param query - Configure the fields to retrieve in the product collection.
     * @param headers - Headers to pass in the request
     * @returns The product collection's details.
     *
     * @example
     * sdk.admin.productCollection.update("pcol_123", {
     *   title: "Summer Collection"
     * })
     * .then(({ collection }) => {
     *   console.log(collection)
     * })
     */
    update(id: string, body: HttpTypes.AdminUpdateCollection, query?: HttpTypes.AdminCollectionParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCollectionResponse>;
    /**
     * This method retrieves a paginated list of collections. It sends a request to the
     * [List Collections](https://docs.medusajs.com/api/admin#collections_getcollections) API route.
     *
     * @param queryParams - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of collections.
     *
     * @example
     * To retrieve the list of collections:
     *
     * ```ts
     * sdk.admin.productCollection.list()
     * .then(({ collections, count, limit, offset }) => {
     *   console.log(collections)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.productCollection.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ collections, count, limit, offset }) => {
     *   console.log(collections)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each collection:
     *
     * ```ts
     * sdk.admin.productCollection.list({
     *   fields: "id,*products"
     * })
     * .then(({ collections, count, limit, offset }) => {
     *   console.log(collections)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(queryParams?: HttpTypes.AdminCollectionListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCollectionListResponse>;
    /**
     * This method retrieves a collection by its ID. It sends a request to the
     * [Get Collection](https://docs.medusajs.com/api/admin#collections_getcollectionsid) API route.
     *
     * @param id - The collection's ID.
     * @param query - Configure the fields to retrieve in the collection.
     * @param headers - Headers to pass in the request
     * @returns The collection's details.
     *
     * @example
     * To retrieve a collection by its ID:
     *
     * ```ts
     * sdk.admin.productCollection.retrieve("pcol_123")
     * .then(({ collection }) => {
     *   console.log(collection)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.productCollection.retrieve("pcol_123", {
     *   fields: "id,*products"
     * })
     * .then(({ collection }) => {
     *   console.log(collection)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieve(id: string, query?: HttpTypes.AdminCollectionParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCollectionResponse>;
    /**
     * This method deletes a product collection. It sends a request to the
     * [Delete Collection](https://docs.medusajs.com/api/admin#collections_deletecollectionsid)
     * API route.
     *
     * @param id - The collection's ID.
     * @param headers - Headers to pass in the request
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.productCollection.delete("pcol_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminCollectionDeleteResponse>;
    /**
     * This method manages the products of a collection to add or remove them. It sends a request
     * to the [Manage Products](https://docs.medusajs.com/api/admin#collections_postcollectionsidproducts)
     * API route.
     *
     * @param id - The collection's ID.
     * @param body - The products to add or remove.
     * @param headers - Headers to pass in the request
     * @returns The product category's details.
     *
     * @example
     * sdk.admin.productCollection.updateProducts("pcol_123", {
     *   add: ["prod_123"],
     *   remove: ["prod_321"]
     * })
     * .then(({ collection }) => {
     *   console.log(collection)
     * })
     */
    updateProducts(id: string, body: HttpTypes.AdminUpdateCollectionProducts, headers?: ClientHeaders): Promise<HttpTypes.AdminCollectionResponse>;
}
//# sourceMappingURL=product-collection.d.ts.map