import { MedusaContainer } from "@medusajs/framework";
import { IApiKeyModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: { container: MedusaContainer }) {
  const apiKeyModuleService: IApiKeyModuleService = container.resolve(Modules.API_KEY);
  
  try {
    const apiKeys = await apiKeyModuleService.listApiKeys();
    console.log("Available API Keys:");
    apiKeys.forEach((key) => {
      console.log(`Title: ${key.title}, Type: ${key.type}, Token: ${key.token}`);
    });
  } catch (error) {
    console.error("Error retrieving API keys:", error);
  }
}
