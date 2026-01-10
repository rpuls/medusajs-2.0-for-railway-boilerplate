import { MedusaService } from "@medusajs/framework/utils";
import { BrandingConfig } from "./models/branding-config";

// Default branding configuration object
// Note: JSON fields match TypeScript's Record<string, unknown> expectation for JSON columns
const DEFAULT_BRANDING_CONFIG = {
  site_title: "",
  copyright_text: "",
  logos: null,
  social_links: {} as Record<string, unknown>,
  contact_info: null,
  carousel_slides: {} as Record<string, unknown>,
  seo_defaults: null,
};

class BrandingModuleService extends MedusaService({
  BrandingConfig,
}) {
  /**
   * Get or create the singleton branding config
   * Since this is a singleton, we always work with the first (and only) record
   */
  async getOrCreateConfig() {
    const configs = await this.listBrandingConfigs({});

    if (configs.length === 0) {
      // Create the initial singleton record with defaults
      const config = await this.createBrandingConfigs(DEFAULT_BRANDING_CONFIG);
      return config;
    }

    return configs[0];
  }

  /**
   * Get the singleton branding config
   */
  async getConfig() {
    const configs = await this.listBrandingConfigs({});
    return configs.length > 0 ? configs[0] : null;
  }

  /**
   * Get branding config or return default if none exists
   * This is useful for storefront endpoints that should always return a config
   */
  async getConfigOrDefault() {
    const config = await this.getConfig();
    return config || DEFAULT_BRANDING_CONFIG;
  }

  /**
   * Update the singleton branding config
   * This method ensures only one config exists by updating the first record
   */
  async updateConfig(data: any) {
    const config = await this.getOrCreateConfig();

    const updated = await this.updateBrandingConfigs([
      {
        id: config.id,
        ...data,
      },
    ]);

    // updateBrandingConfigs returns an array, get the first element
    return updated[0];
  }

  /**
   * Delete the singleton branding config
   * This will delete the only record, effectively resetting the branding config
   */
  async deleteConfig() {
    const config = await this.getConfig();
    if (config) {
      await this.deleteBrandingConfigs([config.id]);
    }
  }
}

export default BrandingModuleService;
export { DEFAULT_BRANDING_CONFIG };
