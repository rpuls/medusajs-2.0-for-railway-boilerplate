var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class ProductCategory {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
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
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/product-categories`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
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
    update(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/product-categories/${id}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
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
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/product-categories`, {
                headers,
                query: query,
            });
        });
    }
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
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/product-categories/${id}`, {
                query,
                headers,
            });
        });
    }
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
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/product-categories/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
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
    updateProducts(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/product-categories/${id}/products`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
}
//# sourceMappingURL=product-category.js.map