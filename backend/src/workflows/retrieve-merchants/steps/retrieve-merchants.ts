import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export type RetrieveMerchantsStepInput = {
  userId: string;
  isSuperAdmin: boolean;
};

export const retrieveMerchantsStep = createStep(
  "retrieve-merchants",
  async (
    { userId, isSuperAdmin }: RetrieveMerchantsStepInput,
    { container }
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: users } = await query.graph({
      entity: "user",
      fields: ["id", "email", "store.name"],
      filters: isSuperAdmin ? {} : { id: userId },
    });

    const merchants = users
      .filter((u) => !!u.store)
      .map((u) => ({
        id: u.id,
        store_name: u.store.name,
        user_email: u.email,
        status: "active",
        can_impersonate: isSuperAdmin,
      }));

    return new StepResponse(merchants);
  }
);
