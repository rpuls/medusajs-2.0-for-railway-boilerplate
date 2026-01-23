import type {
    SubscriberArgs,
    SubscriberConfig,
} from "@medusajs/medusa";
import { updateProductSalesWorkflow } from "../workflows/update-product-sales";

export default async function orderPlacedProductSalesHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    await updateProductSalesWorkflow(container).run({
        input: {
            order_id: data.id,
        },
    });
}

export const config: SubscriberConfig = {
    event: "order.placed",
};

