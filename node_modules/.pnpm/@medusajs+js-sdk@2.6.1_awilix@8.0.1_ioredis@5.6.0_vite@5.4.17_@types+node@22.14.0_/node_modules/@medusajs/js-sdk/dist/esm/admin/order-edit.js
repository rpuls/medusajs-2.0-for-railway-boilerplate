var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class OrderEdit {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method creates an order edit request. It sends a HTTP request to the
     * [Create Order Edit](https://docs.medusajs.com/api/admin#order-edits_postorderedits)
     * API route.
     *
     * @param body - The order edit's details.
     * @param query - Configure the fields to retrieve in the order edit.
     * @param headers - Headers to pass in the request.
     * @returns The order edit's details.
     *
     * @example
     * sdk.admin.orderEdit.initiateRequest({
     *   order_id: "order_123"
     * })
     * .then(({ order_change }) => {
     *   console.log(order_change)
     * })
     */
    initiateRequest(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method changes an order edit to requested. It sends a request to the
     * [Request Order Edit](https://docs.medusajs.com/api/admin#order-edits_postordereditsidrequest)
     * API route.
     *
     * @param id - The order edit's ID.
     * @param query - Configure the fields to retrieve in the order preview.
     * @param headers - Headers to pass in the request.
     * @returns The order preview's details.
     *
     * @example
     * sdk.admin.orderEdit.request("ordch_123")
     * .then(({ order_preview }) => {
     *   console.log(order_preview)
     * })
     */
    request(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits/${id}/request`, {
                method: "POST",
                headers,
                query,
            });
        });
    }
    /**
     * This method confirms an order edit and applies it on the order. It sends a request
     * to the [Confirm Order Edit](https://docs.medusajs.com/api/admin#order-edits_postordereditsidconfirm)
     * API route.
     *
     * @param id - The order edit's ID.
     * @param query - Configure the fields to retrieve in the order preview.
     * @param headers - Headers to pass in the request.
     * @returns The order preview's details.
     *
     * @example
     * sdk.admin.orderEdit.confirm("ordch_123")
     * .then(({ order_preview }) => {
     *   console.log(order_preview)
     * })
     */
    confirm(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits/${id}/confirm`, {
                method: "POST",
                headers,
                query,
            });
        });
    }
    /**
     * This method cancels a requested order edit. It sends a request to the
     * [Cancel Order Edit](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsid)
     * API route.
     *
     * @param id - The order edit's ID.
     * @param query - Query parameters
     * @param headers - Headers to pass in the request.
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.orderEdit.cancelRequest("ordch_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    cancelRequest(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits/${id}`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
    /**
     * This method adds items to an order edit. These items will have the action `ITEM_ADD`.
     *
     * The method sends a request to the [Add Items](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditems)
     * API route.
     *
     * @param id - The order edit's ID.
     * @param body - The items to add.
     * @param query - Configure the fields to retrieve in the order preview.
     * @param headers - Headers to pass in the request.
     * @returns The order preview's details.
     *
     * @example
     * sdk.admin.orderEdit.addItems("ordch_123", {
     *   items: [
     *     {
     *       variant_id: "variant_123",
     *       quantity: 1
     *     }
     *   ]
     * })
     * .then(({ order_preview }) => {
     *   console.log(order_preview)
     * })
     */
    addItems(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits/${id}/items`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method updates the quantity and other details of an item in an order. It sends a request to the
     * [Update Item Quantity](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditemsitemitem_id)
     * API route.
     *
     * @param id - The order edit's ID.
     * @param itemId - The item's ID in the order.
     * @param body - The data to edit in the item.
     * @param query - Configure the fields to retrieve in the order preview.
     * @param headers - Headers to pass in the request.
     * @returns The order preview's details.
     *
     * @example
     * sdk.admin.orderEdit.updateOriginalItem(
     *   "ordch_123",
     *   "orli_123",
     *   {
     *     quantity: 1
     *   }
     * )
     * .then(({ order_preview }) => {
     *   console.log(order_preview)
     * })
     */
    updateOriginalItem(id, itemId, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits/${id}/items/item/${itemId}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method updates an added item in the order edit by the ID of the item's `ITEM_ADD` action.
     *
     * Every item has an `actions` property, whose value is an array of actions.
     * You can check the action's name using its `action` property, and use the value of the `id` property.
     *
     * It sends a request
     * to the [Update Item](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditemsaction_id)
     * API route.
     *
     * @param id - The order edit's ID.
     * @param actionId - The id of the new item's `ITEM_ADD` action.
     * @param body - The data to update.
     * @param query - Configure the fields to retrieve in the order preview.
     * @param headers - Headers to pass in the request.
     * @returns The order preview's details.
     *
     * @example
     * sdk.admin.orderEdit.updateAddedItem(
     *   "ordch_123",
     *   "orli_123",
     *   {
     *     quantity: 1
     *   }
     * )
     * .then(({ order_preview }) => {
     *   console.log(order_preview)
     * })
     */
    updateAddedItem(id, actionId, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits/${id}/items/${actionId}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method removes an added item in the order edit by the ID of the item's `ITEM_ADD` action.
     *
     * Every item has an `actions` property, whose value is an array of actions.
     * You can check the action's name using its `action` property, and use the value of the `id` property.
     *
     * @param id - The order edit's ID.
     * @param actionId - The id of the new item's `ITEM_ADD` action.
     * @param query - Configure the fields to retrieve in the order preview.
     * @param headers - Headers to pass in the request.
     * @returns The order preview's details.
     *
     * @example
     * sdk.admin.orderEdit.removeAddedItem(
     *   "ordch_123",
     *   "orli_123",
     * )
     * .then(({ order_preview }) => {
     *   console.log(order_preview)
     * })
     */
    removeAddedItem(id, actionId, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/order-edits/${id}/items/${actionId}`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
}
//# sourceMappingURL=order-edit.js.map