import { MedusaContainer } from "@medusajs/framework";
import { IApiKeyModuleService, ISalesChannelModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: { container: MedusaContainer }) {
  const apiKeyModuleService: IApiKeyModuleService = container.resolve(Modules.API_KEY);
  const salesChannelModuleService: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  
  try {
    // Get all sales channels
    const salesChannels = await salesChannelModuleService.list({});
    console.log("Available Sales Channels:", salesChannels);
    
    if (salesChannels.length === 0) {
      console.log("Creating default sales channel...");
      const defaultChannel = await salesChannelModuleService.create({
        name: "Default Sales Channel",
        description: "Default Sales Channel for the store",
      });
      console.log("Created default sales channel:", defaultChannel);
      salesChannels.push(defaultChannel);
    }
    
    // Create a new publishable API key
    console.log("Creating new publishable API key...");
    const newKey = await apiKeyModuleService.create({
      title: "Storefront",
      type: "publishable",
    });
    console.log("Created new API key:", newKey);
    
    // Link the API key to all sales channels
    console.log("Linking API key to sales channels...");
    for (const channel of salesChannels) {
      await apiKeyModuleService.addSalesChannelToPublishableKey(newKey.id, channel.id);
      console.log(`Linked sales channel ${channel.id} to API key ${newKey.id}`);
    }
    
    console.log("New API key created and linked to sales channels:", newKey.token);
    console.log("Use this key in your storefront .env.local file as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY");
  } catch (error) {
    console.error("Error creating API key:", error);
  }
}
