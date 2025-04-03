import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import {
  ISalesChannelModuleService,
} from "@medusajs/framework/types";

export const getSalesChannelStep = createStep(
  "get-sales-channel",
  async (_input: void, { container }) => {
    const salesChannelService = container.resolve<ISalesChannelModuleService>(
      Modules.SALES_CHANNEL
    );

    let [salesChannel] = await salesChannelService.listSalesChannels(
      {},
      { take: 1 }
    );

    return new StepResponse(salesChannel);
  }
);
