import Medusa from "@medusajs/js-sdk";
import { BrandingResponse } from "./types";

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
});

export const brandingFetcher = async (): Promise<BrandingResponse> => {
  try {
    return await sdk.client.fetch<BrandingResponse>("/admin/branding");
  } catch (e: any) {
    // If no config exists, return empty branding
    if (e?.status === 404) {
      return {
        branding: {
          id: "",
          site_title: null,
          copyright_text: null,
          logos: null,
          social_links: null,
          contact_info: null,
          carousel_slides: null,
          seo_defaults: null,
        },
      };
    }
    throw e;
  }
};
