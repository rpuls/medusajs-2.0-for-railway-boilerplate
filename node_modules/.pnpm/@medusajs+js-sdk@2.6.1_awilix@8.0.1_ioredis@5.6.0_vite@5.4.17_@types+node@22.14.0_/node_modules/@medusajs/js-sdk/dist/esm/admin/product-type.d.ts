import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class ProductType {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    /**
     * This method creates a product type. It sends a request to the
     * [Create Product Type](https://docs.medusajs.com/api/admin#product-types_postproducttypes)
     * API route.
     *
     * @param body - The product type's details.
     * @param query - Configure the fields to retrieve in the product type.
     * @param headers - Headers to pass in the request
     * @returns The product type's details.
     *
     * @example
     * sdk.admin.productType.create({
     *   value: "Clothes"
     * })
     * .then(({ product_type }) => {
     *   console.log(product_type)
     * })
     */
    create(body: HttpTypes.AdminCreateProductType, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductTypeResponse>;
    /**
     * This method updates a product type. It sends a request to the
     * [Update Product Type](https://docs.medusajs.com/api/admin#product-types_postproducttypesid)
     * API route.
     *
     * @param id - The product type's ID.
     * @param body - The data to update in the product type.
     * @param query - Configure the fields to retrieve in the product type.
     * @param headers - Headers to pass in the request
     * @returns The product type's details.
     *
     * @example
     * sdk.admin.productType.update("ptyp_123", {
     *   value: "Clothes"
     * })
     * .then(({ product_type }) => {
     *   console.log(product_type)
     * })
     */
    update(id: string, body: HttpTypes.AdminUpdateProductType, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductTypeResponse>;
    /**
     * This method retrieves a paginated list of product types. It sends a request to the
     * [List Product Types](https://docs.medusajs.com/api/admin#product-types_getproducttypes) API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of product types.
     *
     * @example
     * To retrieve the list of product types:
     *
     * ```ts
     * sdk.admin.productType.list()
     * .then(({ product_types, count, limit, offset }) => {
     *   console.log(product_types)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.productType.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ product_types, count, limit, offset }) => {
     *   console.log(product_types)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each product type:
     *
     * ```ts
     * sdk.admin.productType.list({
     *   fields: "id,*products"
     * })
     * .then(({ product_types, count, limit, offset }) => {
     *   console.log(product_types)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(query?: HttpTypes.AdminProductTypeListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductTypeListResponse>;
    /**
     * This method retrieves a product type by its ID. It sends a request to the
     * [Get Product Type](https://docs.medusajs.com/api/admin#product-types_getproducttypesid)
     * API route.
     *
     * @param id - The product type's ID.
     * @param query - Configure the fields to retrieve in the product type.
     * @param headers - Headers to pass in the request
     * @returns The product type's details.
     *
     * @example
     * To retrieve a product type by its ID:
     *
     * ```ts
     * sdk.admin.productType.retrieve("ptyp_123")
     * .then(({ product_type }) => {
     *   console.log(product_type)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.productType.retrieve("ptyp_123", {
     *   fields: "id,*products"
     * })
     * .then(({ product_type }) => {
     *   console.log(product_type)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieve(id: string, query?: HttpTypes.AdminProductTypeParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductTypeResponse>;
    /**
     * This method deletes a product type. It sends a request to the
     * [Delete Product Type](https://docs.medusajs.com/api/admin#product-types_deleteproducttypesid)
     * API route.
     *
     * @param id - The product type's ID.
     * @param headers - Headers to pass in the request
     * @returns The product type's details.
     *
     * @example
     * sdk.admin.productType.delete("ptyp_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminProductTypeDeleteResponse>;
}
//# sourceMappingURL=product-type.d.ts.map