import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { IStoreModuleService } from "@medusajs/framework/types";

export const searchStoresStep = createStep(
  "search-stores",
  async (storeName: string, { container }) => {
    const storeService: IStoreModuleService = container.resolve(Modules.STORE);
    const stores = await storeService.listStores({ q: storeName });
    return new StepResponse(stores);
  }
);
