import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class ProductCategory {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    /**
     * This method creates a product category. It sends a request to the
     * [Create Category](https://docs.medusajs.com/api/admin#product-categories_postproductcategories)
     * API route.
     *
     * @param body - The details of the category to create.
     * @param query - Configure the fields to retrieve in the category.
     * @param headers - Headers to pass in the request
     * @returns The category's details.
     *
     * @example
     * sdk.admin.productCategory.create({
     *   name: "Shirts"
     * })
     * .then(({ product_category }) => {
     *   console.log(product_category)
     * })
     */
    create(body: HttpTypes.AdminCreateProductCategory, query?: HttpTypes.AdminProductCategoryParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductCategoryResponse>;
    /**
     * This method updates a product category. It sends a request to the
     * [Update Category](https://docs.medusajs.com/api/admin#product-categories_postproductcategoriesid)
     * API route.
     *
     * @param id - The product category's ID.
     * @param body - The data to update in the category.
     * @param query - Configure the fields to retrieve in the category.
     * @param headers - Headers to pass in the request
     * @returns The category's details.
     *
     * @example
     * sdk.admin.productCategory.update("pcat_123", {
     *   name: "Shirts"
     * })
     * .then(({ product_category }) => {
     *   console.log(product_category)
     * })
     */
    update(id: string, body: HttpTypes.AdminUpdateProductCategory, query?: HttpTypes.AdminProductCategoryParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductCategoryResponse>;
    /**
     * This method retrieves a paginated list of product categories. It sends a request to the
     * [List Product Categories](https://docs.medusajs.com/api/admin#product-categories_getproductcategories) API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of product categories.
     *
     * @example
     * To retrieve the list of product categories:
     *
     * ```ts
     * sdk.admin.productCategory.list()
     * .then(({ product_categories, count, limit, offset }) => {
     *   console.log(product_categories)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.productCategory.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ product_categories, count, limit, offset }) => {
     *   console.log(product_categories)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each product category:
     *
     * ```ts
     * sdk.admin.productCategory.list({
     *   fields: "id,*products"
     * })
     * .then(({ product_categories, count, limit, offset }) => {
     *   console.log(product_categories)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(query?: HttpTypes.AdminProductCategoryListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductCategoryListResponse>;
    /**
     * This method retrieves a product category by its ID. It sends a request to the
     * [Get Product Category](https://docs.medusajs.com/api/admin#product-categories_getproductcategoriesid) API route.
     *
     * @param id - The category's ID.
     * @param query - Configure the fields to retrieve in the product category.
     * @param headers - Headers to pass in the request
     * @returns The product category's details.
     *
     * @example
     * To retrieve a product category by its ID:
     *
     * ```ts
     * sdk.admin.productCategory.retrieve("pcat_123")
     * .then(({ product_category }) => {
     *   console.log(product_category)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.productCategory.retrieve("pcat_123", {
     *   fields: "id,*products"
     * })
     * .then(({ product_category }) => {
     *   console.log(product_category)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieve(id: string, query?: HttpTypes.AdminProductCategoryParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductCategoryResponse>;
    /**
     * This method deletes a product category. It sends a request to the
     * [Delete Product Category](https://docs.medusajs.com/api/admin#product-categories_deleteproductcategoriesid)
     * API route.
     *
     * @param id - The category's ID.
     * @param headers - Headers to pass in the request
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.productCategory.delete("pcat_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminProductCategoryDeleteResponse>;
    /**
     * This method manaes the products of a category to add or remove them. It sends a request
     * to the [Manage Products](https://docs.medusajs.com/api/admin#product-categories_postproductcategoriesidproducts)
     * API route.
     *
     * @param id - The category's ID.
     * @param body - The products to create or update.
     * @param query - Configure the fields to retrieve in the product category.
     * @param headers - Headers to pass in the request
     * @returns The product category's details.
     *
     * @example
     * sdk.admin.productCategory.updateProducts("pcat_123", {
     *   add: ["prod_123"],
     *   remove: ["prod_321"]
     * })
     * .then(({ product_category }) => {
     *   console.log(product_category)
     * })
     */
    updateProducts(id: string, body: HttpTypes.AdminUpdateProductCategoryProducts, query?: HttpTypes.AdminProductCategoryParams, headers?: ClientHeaders): Promise<HttpTypes.AdminProductCategoryResponse>;
}
//# sourceMappingURL=product-category.d.ts.map