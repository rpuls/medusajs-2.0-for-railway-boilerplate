import { createOrdersWorkflow } from "@medusajs/medusa/core-flows";
// Define UserDTO interface
interface UserDTO {
  id: string;
  email: string;
}
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
