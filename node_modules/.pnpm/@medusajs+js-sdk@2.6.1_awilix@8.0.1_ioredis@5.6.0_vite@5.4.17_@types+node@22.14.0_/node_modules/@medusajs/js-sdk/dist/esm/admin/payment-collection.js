var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class PaymentCollection {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method creates a payment collection. It sends a request to the
     * [Create Payment Collection](https://docs.medusajs.com/api/admin#payment-collections_postpaymentcollections)
     * API route.
     *
     * @param body - The details of the payment collection to create.
     * @param query - Configure the fields to retrieve in the payment collection.
     * @param headers - Headers to pass in the request
     * @returns The payment collection's details.
     *
     * @example
     * sdk.admin.paymentCollection.create({
     *   order_id: "order_123"
     * })
     * .then(({ payment_collection }) => {
     *   console.log(payment_collection)
     * })
     */
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/payment-collections`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method deletes a payment collection. It sends a request to the
     * [Delete Payment Collection](https://docs.medusajs.com/api/admin#payment-collections_deletepaymentcollectionsid)
     * API route.
     *
     * @param id - The payment collection's ID.
     * @param headers - Headers to pass in the request
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.paymentCollection.delete("paycol_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/payment-collections/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
    /**
     * This method marks a payment collection as paid. It sends a request to the
     * [Mark as Paid](https://docs.medusajs.com/api/admin#payment-collections_postpaymentcollectionsidmarkaspaid)
     * API route.
     *
     * The API route creates and authorizes a payment session, then capture its payment,
     * using the manual payment provider.
     *
     * @param id - The payment collection to mark as paid.
     * @param body - The details to mark the payment collection as paid.
     * @param query - Configure the fields to retrieve in the payment collection.
     * @param headers - Headers to pass in the request.
     * @returns The payment collection's details.
     *
     * @example
     * sdk.admin.paymentCollection.markAsPaid("paycol_123", {
     *   order_id: "order_123"
     * })
     * .then(({ payment_collection }) => {
     *   console.log(payment_collection)
     * })
     */
    markAsPaid(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/payment-collections/${id}/mark-as-paid`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
}
//# sourceMappingURL=payment-collection.js.map