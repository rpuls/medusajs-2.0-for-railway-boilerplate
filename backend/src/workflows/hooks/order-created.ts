import { createOrdersWorkflow } from "@medusajs/medusa/core-flows";
import { UserDTO } from "@medusajs/framework/types";
import { linkOrderToStoreWorkflow } from "../link-order-to-store";

createOrdersWorkflow.hooks.orderCreated(async ({ order }, { container }) => {
  const loggedInUser = container.resolve("loggedInUser") as UserDTO;

  await linkOrderToStoreWorkflow(container).run({
    input: {
      orderId: order.id,
      userId: loggedInUser.id,
    },
  });
});
