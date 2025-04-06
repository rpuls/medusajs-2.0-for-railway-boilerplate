import { MedusaContainer } from "@medusajs/framework";
import { IApiKeyModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: { container: MedusaContainer }) {
  const apiKeyModuleService: IApiKeyModuleService = container.resolve(Modules.API_KEY);
  
  try {
    const apiKeys = await apiKeyModuleService.listApiKeys();
    console.log("Available API Keys:");
    
    for (const key of apiKeys) {
      console.log(`Title: ${key.title}, Type: ${key.type}, Token: ${key.token}`);
      
      // Check if the key is valid
      try {
        const isValid = await apiKeyModuleService.validatePublishableApiKey(key.token);
        console.log(`Key ${key.token} is valid: ${isValid}`);
        
        // Check if the key has sales channels
        const salesChannels = await apiKeyModuleService.listSalesChannelsByPublishableKey(key.token);
        console.log(`Sales channels for key ${key.token}:`, salesChannels);
      } catch (error) {
        console.error(`Error validating key ${key.token}:`, error);
      }
    }
  } catch (error) {
    console.error("Error retrieving API keys:", error);
  }
}
