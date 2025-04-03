import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const getStoreStep = createStep(
  "get-store",
  async (userId: string, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: users } = await query.graph({
      entity: "user",
      fields: ["id", "email", "store.*"],
      filters: {
        id: [userId],
      },
    });

    const store = users[0].store;

    return new StepResponse(store);
  }
);
