import { OrderChangeDTO, OrderDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
export declare function throwIfOrderIsCancelled({ order }: {
    order: OrderDTO;
}): void;
export declare function throwIfItemsDoesNotExistsInOrder({ order, inputItems, }: {
    order: Pick<OrderDTO, "id" | "items">;
    inputItems: OrderWorkflow.CreateOrderFulfillmentWorkflowInput["items"];
}): void;
export declare function throwIfItemsAreNotGroupedByShippingRequirement({ order, inputItems, }: {
    order: Pick<OrderDTO, "id" | "items">;
    inputItems: OrderWorkflow.CreateOrderFulfillmentWorkflowInput["items"];
}): void;
export declare function throwIfIsCancelled(obj: unknown & {
    id: string;
    canceled_at?: any;
}, type: string): void;
export declare function throwIfOrderChangeIsNotActive({ orderChange, }: {
    orderChange: OrderChangeDTO;
}): void;
export declare function throwIfItemsDoesNotExistsInReturn({ orderReturn, inputItems, }: {
    orderReturn: Pick<ReturnDTO, "id" | "items">;
    inputItems: OrderWorkflow.CreateOrderFulfillmentWorkflowInput["items"];
}): void;
//# sourceMappingURL=order-validation.d.ts.map