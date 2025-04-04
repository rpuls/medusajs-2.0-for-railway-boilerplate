"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
class Payment {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method retrieves a paginated list of payments. It sends a request to the
     * [List Payments](https://docs.medusajs.com/api/admin#payments_getpayments) API route.
     *
     * @param query  - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of payments.
     *
     * @example
     * To retrieve the list of payments:
     *
     * ```ts
     * sdk.admin.payment.list()
     * .then(({ payments, count, limit, offset }) => {
     *   console.log(payments)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.payment.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ payments, count, limit, offset }) => {
     *   console.log(payments)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each payment:
     *
     * ```ts
     * sdk.admin.payment.list({
     *   fields: "id,*payment_collection"
     * })
     * .then(({ payments, count, limit, offset }) => {
     *   console.log(payments)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    async list(query, headers) {
        return await this.client.fetch(`/admin/payments`, {
            query,
            headers,
        });
    }
    /**
     * This method retrieves a paginated list of payment providers. It sends a request to the
     * [List Payment Providers](https://docs.medusajs.com/api/admin#payments_getpaymentspaymentproviders) API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of payment providers.
     *
     * @example
     * To retrieve the list of payment providers:
     *
     * ```ts
     * sdk.admin.payment.listPaymentProviders()
     * .then(({ payment_providers, count, limit, offset }) => {
     *   console.log(payment_providers)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.payment.listPaymentProviders({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ payment_providers, count, limit, offset }) => {
     *   console.log(payment_providers)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each payment provider:
     *
     * ```ts
     * sdk.admin.payment.listPaymentProviders({
     *   fields: "id,is_enabled"
     * })
     * .then(({ payment_providers, count, limit, offset }) => {
     *   console.log(payment_providers)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    async listPaymentProviders(query, headers) {
        return await this.client.fetch(`/admin/payments/payment-providers`, {
            query,
            headers,
        });
    }
    /**
     * This method retrieves a payment's details. It sends a request to the
     * [Get Payment](https://docs.medusajs.com/api/admin#payments_getpaymentsid)
     * API route.
     *
     * @param id - The payment's ID.
     * @param query - Configure the fields to retrieve in the payment.
     * @param headers - Headers to pass in the request
     * @returns The payment's details.
     *
     * @example
     * To retrieve a payment by its ID:
     *
     * ```ts
     * sdk.admin.payment.retrieve("pay_123")
     * .then(({ payment }) => {
     *   console.log(payment)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.payment.retrieve("pay_123", {
     *   fields: "id,*payment_collection"
     * })
     * .then(({ payment }) => {
     *   console.log(payment)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/payments/${id}`, {
            query,
            headers,
        });
    }
    /**
     * This method captures a payment. It sends a request to the
     * [Capture Payment](https://docs.medusajs.com/api/admin#payments_postpaymentsidcapture) API route.
     *
     * The API route uses the `capturePayment` method of the payment provider associated with the payment's collection.
     *
     * @param id - The payment's ID.
     * @param body - The capture's details.
     * @param query - Configure the fields to retrieve in the payment.
     * @param headers - Headers to pass in the request
     * @returns The payment's details.
     *
     * @example
     * sdk.admin.payment.capture("paycol_123", {})
     * .then(({ payment }) => {
     *   console.log(payment)
     * })
     */
    async capture(id, body, query, headers) {
        return await this.client.fetch(`/admin/payments/${id}/capture`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    /**
     * This method refunds a payment. It sends a request to the
     * [Refund Payment](https://docs.medusajs.com/api/admin#payments_postpaymentsidrefund) API route.
     *
     * The API route uses the `refundPayment` method of the payment provider associated with the payment's collection.
     *
     * @param id - The payment's ID.
     * @param body - The refund's details.
     * @param query - Configure the fields to retrieve in the payment.
     * @param headers - Headers to pass in the request
     * @returns The payment's details.
     *
     * @example
     * sdk.admin.payment.refund("paycol_123", {})
     * .then(({ payment }) => {
     *   console.log(payment)
     * })
     */
    async refund(id, body, query, headers) {
        return await this.client.fetch(`/admin/payments/${id}/refund`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map