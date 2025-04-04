import { MetadataType } from "../../common";
import { BigNumberInput } from "../../totals";
import { CreateFulfillmentLabelWorkflowDTO } from "../fulfillment";
/**
 * The details of an item in the shipment.
 */
interface CreateOrderShipmentItem {
    /**
     * The ID of the order's item to ship.
     */
    id: string;
    /**
     * The quantity of the item to ship.
     */
    quantity: BigNumberInput;
}
/**
 * The details required to create a shipment for an order.
 */
export interface CreateOrderShipmentWorkflowInput {
    /**
     * The ID of the order to create a shipment for.
     */
    order_id: string;
    /**
     * The ID of the fulfillment to create a shipment for.
     */
    fulfillment_id: string;
    /**
     * The ID of the user creating the shipment.
     */
    created_by?: string;
    /**
     * The items to create a shipment for.
     */
    items: CreateOrderShipmentItem[];
    /**
     * The shipment's labels.
     */
    labels?: CreateFulfillmentLabelWorkflowDTO[];
    /**
     * Whether to notify the customer about the shipment.
     */
    no_notification?: boolean;
    /**
     * Custom key-value pairs related to the shipment.
     */
    metadata?: MetadataType;
}
export {};
//# sourceMappingURL=create-shipment.d.ts.map