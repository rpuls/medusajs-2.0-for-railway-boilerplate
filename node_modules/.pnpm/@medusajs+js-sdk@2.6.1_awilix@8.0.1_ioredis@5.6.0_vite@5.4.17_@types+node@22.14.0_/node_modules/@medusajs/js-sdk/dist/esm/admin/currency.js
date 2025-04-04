var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Currency {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method retrieves a paginated list of currencies. It sends a request to the
     * [List Currencies](https://docs.medusajs.com/api/admin#currencies_getcurrencies)
     * API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of currencies.
     *
     * @example
     * To retrieve the list of currencies:
     *
     * ```ts
     * sdk.admin.currency.list()
     * .then(({ currencies, count, limit, offset }) => {
     *   console.log(currencies)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.currency.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ currencies, count, limit, offset }) => {
     *   console.log(currencies)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each currency:
     *
     * ```ts
     * sdk.admin.currency.list({
     *   fields: "code,symbol"
     * })
     * .then(({ currencies, count, limit, offset }) => {
     *   console.log(currencies)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/currencies`, {
                headers,
                query,
            });
        });
    }
    /**
     * This method retrieves a currency by its code. It sends a request to the
     * [Get Currency](https://docs.medusajs.com/api/admin#currencies_getcurrenciescode) API route.
     *
     * @param code - The currency's code.
     * @param query - Configure the fields to retrieve in the currency.
     * @param headers - Headers to pass in the request
     * @returns The currency's details.
     *
     * @example
     * To retrieve a currency by its code:
     *
     * ```ts
     * sdk.admin.currency.retrieve("usd")
     * .then(({ currency }) => {
     *   console.log(currency)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.currency.retrieve("usd", {
     *   fields: "code,symbol"
     * })
     * .then(({ currency }) => {
     *   console.log(currency)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieve(code, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/currencies/${code}`, {
                headers,
                query,
            });
        });
    }
}
//# sourceMappingURL=currency.js.map