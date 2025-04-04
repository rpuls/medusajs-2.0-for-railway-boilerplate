var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class PricePreference {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method retrieves a price preference. It sends a request to the
     * [Get Price Preference](https://docs.medusajs.com/api/admin#price-preferences_getpricepreferencesid)
     * API route.
     *
     * @param id - The price preference's ID.
     * @param query - Configure the fields to retrieve in the price preference.
     * @param headers - Headers to pass in the request
     * @returns The price preference's details.
     *
     * @example
     * To retrieve a price preference by its ID:
     *
     * ```ts
     * sdk.admin.pricePreference.retrieve("prpref_123")
     * .then(({ price_preference }) => {
     *   console.log(price_preference)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.pricePreference.retrieve("prpref_123", {
     *   fields: "id,is_tax_inclusive"
     * })
     * .then(({ price_preference }) => {
     *   console.log(price_preference)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-preferences/${id}`, {
                method: "GET",
                headers,
                query,
            });
        });
    }
    /**
     * This method retrieves a paginated list of price preferences. It sends a request to the
     * [List Price Preferences](https://docs.medusajs.com/api/admin#price-preferences_getpricepreferences) API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of price preferences.
     *
     * @example
     * To retrieve the list of price preferences:
     *
     * ```ts
     * sdk.admin.pricePreference.list()
     * .then(({ price_preferences, count, limit, offset }) => {
     *   console.log(price_preferences)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.pricePreference.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ price_preferences, count, limit, offset }) => {
     *   console.log(price_preferences)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each price preference:
     *
     * ```ts
     * sdk.admin.pricePreference.list({
     *   fields: "id,is_tax_inclusive"
     * })
     * .then(({ price_preferences, count, limit, offset }) => {
     *   console.log(price_preferences)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-preferences`, {
                method: "GET",
                headers,
                query,
            });
        });
    }
    /**
     * This method creates a price preference. It sends a request to the
     * [Create Price Preference](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferences)
     * API route.
     *
     * @param body - The details of the price preference to create.
     * @param query - Configure the fields to retrieve in the price preference.
     * @param headers - Headers to pass in the request
     * @returns The price preference's details.
     *
     * @example
     * sdk.admin.pricePreference.create({
     *   attribute: "region_id",
     *   value: "region_123",
     *   is_tax_inclusive: true
     * })
     * .then(({ price_preference }) => {
     *   console.log(price_preference)
     * })
     */
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-preferences`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method updates a price preference. It sends a request to the
     * [Update Price Preference](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferencesid)
     * API route.
     *
     * @param id - The price preference's ID.
     * @param body - The data to update in the price preference.
     * @param query - Configure the fields to retrieve in the price preference.
     * @param headers - Headers to pass in the request
     * @returns The price preference's details.
     *
     * @example
     * sdk.admin.pricePreference.update("prpref_123", {
     *   is_tax_inclusive: true
     * })
     * .then(({ price_preference }) => {
     *   console.log(price_preference)
     * })
     */
    update(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-preferences/${id}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method deletes a price preference. It sends a request to the
     * [Delete Price Preference](https://docs.medusajs.com/api/admin#price-preferences_deletepricepreferencesid)
     * API route.
     *
     * @param id - The price preference's ID.
     * @param headers - Headers to pass in the request
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.pricePreference.delete("prpref_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/price-preferences/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
}
//# sourceMappingURL=price-preference.js.map