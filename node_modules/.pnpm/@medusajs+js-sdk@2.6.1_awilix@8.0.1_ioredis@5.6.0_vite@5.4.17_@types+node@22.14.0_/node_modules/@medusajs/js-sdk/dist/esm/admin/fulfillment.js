var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Fulfillment {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method creates a fulfillment. It sends a request to the
     * [Create Fulfillment](https://docs.medusajs.com/api/admin#fulfillments_postfulfillments)
     * API route.
     *
     * @param body - The fulfillment's details.
     * @param query - Configure the fields to retrieve in the fulfillment.
     * @param headers - Headers to pass in the request.
     * @returns The fulfillment's details.
     *
     * @example
     * sdk.admin.fulfillment.create({
     *   location_id: "sloc_123",
     *   provider_id: "my_fulfillment",
     *   delivery_address: {
     *     country_code: "us"
     *   },
     *   items: [
     *     {
     *       title: "Shirt",
     *       sku: "SHIRT",
     *       quantity: 1,
     *       barcode: "123"
     *     }
     *   ],
     *   labels: [],
     *   order: {},
     *   order_id: "order_123"
     * })
     * .then(({ fulfillment }) => {
     *   console.log(fulfillment)
     * })
     */
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/fulfillments`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method cancels a fulfillment. It sends a request to the
     * [Cancel Fulfillment](https://docs.medusajs.com/api/admin#fulfillments_postfulfillmentsidcancel)
     * API route.
     *
     * @param id - The fulfillment's ID.
     * @param query - Configure the fields to retrieve in the fulfillment.
     * @param headers - Headers to pass in the request.
     * @returns The fulfillment's details.
     *
     * @example
     * sdk.admin.fulfillment.cancel("ful_123")
     * .then(({ fulfillment }) => {
     *   console.log(fulfillment)
     * })
     */
    cancel(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/fulfillments/${id}`, {
                method: "POST",
                body: {},
                headers,
                query
            });
        });
    }
    /**
     * This method creates a shipment for a fulfillment. It sends a request to the
     * [Create Shipment](https://docs.medusajs.com/api/admin#fulfillments_postfulfillmentsidshipment)
     * API route.
     *
     * @param id - The fulfillment's ID.
     * @param body - The shipment's details.
     * @param query - Configure the fields to retrieve in the fulfillment.
     * @param headers - Headers to pass in the request.
     * @returns The fulfillment's details.
     *
     * @example
     * sdk.admin.fulfillment.createShipment("ful_123", {
     *   labels: [
     *     {
     *       tracking_number: "123",
     *       tracking_url: "example.com",
     *       label_url: "example.com"
     *     }
     *   ]
     * })
     * .then(({ fulfillment }) => {
     *   console.log(fulfillment)
     * })
     */
    createShipment(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/fulfillments/${id}/shipment`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
}
//# sourceMappingURL=fulfillment.js.map