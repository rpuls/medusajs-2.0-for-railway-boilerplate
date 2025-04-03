import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import {
  CreateOrderDTO,
  IOrderModuleService,
  IPaymentModuleService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  OrderWorkflowEvents,
} from "@medusajs/framework/utils";
import { Modules } from "@medusajs/framework/utils";
import productStoreLink from "../links/product-store";
import { linkOrderToStoreWorkflow } from "src/workflows/link-order-to-store";
import { createOrderPaymentCollectionAutorizedWorkflow } from "src/workflows/create-order-payment-collection-autorized";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id;

  const orderModuleService: IOrderModuleService = container.resolve(
    Modules.ORDER
  );
  const paymentModuleService = container.resolve<IPaymentModuleService>(
    Modules.PAYMENT
  );
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // retrieve order
  const order = await orderModuleService.retrieveOrder(orderId, {
    relations: [
      "items",
      "shipping_address",
      "billing_address",
      "shipping_methods",
    ],
  });

  // retrieve payment collection (this is where a payment status is stored)
  const { data: paymentCollections } = await query.graph({
    entity: "order_payment_collection",
    fields: ["payment_collection_id"],
    filters: {
      order_id: order.id,
    },
  });
  const paymentCollectionId = paymentCollections[0].payment_collection_id;
  const paymentCollection =
    await paymentModuleService.retrievePaymentCollection(paymentCollectionId);

  // get products of store
  //
  const productsIds = order.items?.map((order) => order.product_id);
  const { data: productsStores } = await query.graph({
    entity: productStoreLink.entryPoint,
    fields: ["*"],
    filters: {
      product_id: productsIds,
    },
  });
  const productsToStoreMap = productsStores.reduce(
    (acc, { product_id, store_id }) => {
      acc[product_id] = store_id;
      return acc;
    },
    {}
  );

  // group items per store
  //
  const groupedItemsPerStore = order.items.reduce((acc, item) => {
    const storeId = productsToStoreMap[item.product_id];
    if (!acc[storeId]) {
      acc[storeId] = [];
    }
    acc[storeId].push({ ...item, id: undefined });
    return acc;
  }, {});

  // create child orders, each order will have store's related items only
  //
  if (Object.keys(groupedItemsPerStore).length > 1) {
    for (const storeId in groupedItemsPerStore) {
      // create child order
      const childOrder = await orderModuleService.createOrders({
        ...order,
        id: undefined,
        shipping_address_id: undefined,
        shipping_address: {
          ...order.shipping_address,
          id: undefined,
        },
        billing_address_id: undefined,
        billing_address: {
          ...order.billing_address,
          id: undefined,
        },
        items: groupedItemsPerStore[storeId],
        shipping_methods: order.shipping_methods.map((sm) => ({
          ...sm,
          id: undefined,
        })),
        // metadata: {  },
      } as CreateOrderDTO);

      // copy payment
      const createdPaymentCollection =
        await createOrderPaymentCollectionAutorizedWorkflow(container).run({
          input: {
            orderId: childOrder.id,
            amount: paymentCollection.amount,
            authorized_amount: paymentCollection.authorized_amount,
            captured_amount: paymentCollection.captured_amount,
            currencyCode: paymentCollection.currency_code,
            regionId: paymentCollection.region_id,
            status: paymentCollection.status,
          },
        });

      // link order to store
      await linkOrderToStoreWorkflow(container).run({
        input: {
          orderId: childOrder.id,
          storeId: storeId,
        },
      });
    }

    // delete origin order
    await orderModuleService.deleteOrders(order.id);
  }
}

// subscriber config
export const config: SubscriberConfig = {
  event: OrderWorkflowEvents.PLACED,
};
