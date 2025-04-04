var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class PriceList {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method retrieves a price list. It sends a request to the
     * [Get Price List](https://docs.medusajs.com/v2/api/admin#price-lists_getpricelistsid)
     * API route.
     *
     * @param id - The price list's ID.
     * @param query - Configure the fields to retrieve in the price list.
     * @param headers - Headers to pass in the request
     * @returns The price list's details.
     *
     * @example
     * To retrieve a price list by its ID:
     *
     * ```ts
     * sdk.admin.priceList.retrieve("plist_123")
     * .then(({ price_list }) => {
     *   console.log(price_list)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.priceList.retrieve("plist_123", {
     *   fields: "id,*prices"
     * })
     * .then(({ price_list }) => {
     *   console.log(price_list)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/v2/api/store#select-fields-and-relations).
     */
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-lists/${id}`, {
                method: "GET",
                headers,
                query,
            });
        });
    }
    /**
     * This method retrieves a paginated list of price lists. It sends a request to the
     * [List Price Lists](https://docs.medusajs.com/v2/api/admin#price-lists_getpricelists) API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of price lists.
     *
     * @example
     * To retrieve the list of price lists:
     *
     * ```ts
     * sdk.admin.priceList.list()
     * .then(({ price_lists, count, limit, offset }) => {
     *   console.log(price_lists)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.priceList.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ price_lists, count, limit, offset }) => {
     *   console.log(price_lists)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each price list:
     *
     * ```ts
     * sdk.admin.priceList.list({
     *   fields: "id,*prices"
     * })
     * .then(({ price_lists, count, limit, offset }) => {
     *   console.log(price_lists)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/v2/api/store#select-fields-and-relations).
     */
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-lists`, {
                method: "GET",
                headers,
                query,
            });
        });
    }
    /**
     * This method creates a price list. It sends a request to the
     * [Create Price List](https://docs.medusajs.com/v2/api/admin#price-lists_postpricelists)
     * API route.
     *
     * @param body - The details of the price list to create.
     * @param query - Configure the fields to retrieve in the price list.
     * @param headers - Headers to pass in the request
     * @returns The price list's details.
     *
     * @example
     * sdk.admin.priceList.create({
     *   title: "My Price List",
     *   status: "active",
     *   type: "sale",
     *   prices: [
     *     {
     *       variant_id: "variant_123",
     *       amount: 10,
     *       currency_code: "usd",
     *       rules: {
     *         region_id: "reg_123"
     *       }
     *     }
     *   ]
     * })
     * .then(({ price_list }) => {
     *   console.log(price_list)
     * })
     */
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-lists`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method updates a price list. It sends a request to the
     * [Update Price List](https://docs.medusajs.com/v2/api/admin#price-lists_postpricelistsid)
     * API route.
     *
     * @param id - The price list's ID.
     * @param body - The data to update in the price list.
     * @param query - Configure the fields to retrieve in the price list.
     * @param headers - Headers to pass in the request
     * @returns The price list's details.
     *
     * @example
     * sdk.admin.priceList.update("plist_123", {
     *   title: "My Price List",
     * })
     * .then(({ price_list }) => {
     *   console.log(price_list)
     * })
     */
    update(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-lists/${id}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method deletes a price list. It sends a request to the
     * [Delete Price List](https://docs.medusajs.com/v2/api/admin#price-lists_deletepricelistsid)
     * API route.
     *
     * @param id - The price list's ID.
     * @param headers - Headers to pass in the request
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.priceList.delete("plist_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-lists/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
    /**
     * This method manages the prices of a price list to create, update, or delete them.
     * It sends a request to the [Manage Prices](https://docs.medusajs.com/v2/api/admin#price-lists_postpricelistsidpricesbatch)
     * API route.
     *
     * @param id - The price list's ID.
     * @param body - The prices to create, update, or delete.
     * @param query - Configure the fields to retrieve in the price list.
     * @param headers - Headers to pass in the request
     * @returns The price list's details.
     *
     * @example
     * sdk.admin.priceList.batchPrices("plist_123", {
     *   create: [{
     *     variant_id: "variant_123",
     *     currency_code: "usd",
     *     amount: 10,
     *     rules: {
     *       region_id: "reg_123"
     *     }
     *   }],
     *   update: [{
     *     id: "price_123",
     *     variant_id: "variant_123",
     *     amount: 20,
     *   }],
     *   delete: ["price_123"]
     * })
     * .then(({ created, updated, deleted }) => {
     *   console.log(created, updated, deleted)
     * })
     */
    batchPrices(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-lists/${id}/prices/batch`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method removes products from a price list. It sends a request to the
     * [Remove Product](https://docs.medusajs.com/v2/api/admin#price-lists_postpricelistsidproducts)
     * API route.
     *
     * @param id - The price list's ID.
     * @param body - The details of the products to remove.
     * @param query - Configure the fields to retrieve in the price list.
     * @param headers - Headers to pass in the request
     * @returns The price list's details.
     *
     * @example
     * sdk.admin.priceList.linkProducts("plist_123", {
     *   remove: ["prod_123"]
     * })
     * .then(({ price_list }) => {
     *   console.log(price_list)
     * })
     */
    linkProducts(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-lists/${id}/products`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
}
//# sourceMappingURL=price-list.js.map