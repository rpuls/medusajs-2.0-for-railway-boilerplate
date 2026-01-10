import { model } from "@medusajs/framework/utils";

export const BrandingConfig = model.define("branding_config", {
  id: model.id().primaryKey(),
  // Site title
  site_title: model.text(),

  // Copyright text
  copyright_text: model.text(),

  // Logos stored as JSON: { main: { url, alt, width, height }, footer: {...}, favicon: {...} }
  logos: model.json(),

  // Social links stored as JSON array: [{ platform: string, url: string }]
  social_links: model.json(),

  // Contact info stored as JSON: { email: string, phone: string, address: string }
  contact_info: model.json(),

  // Carousel slides stored as JSON array
  carousel_slides: model.json(),

  // SEO defaults stored as JSON: { meta_description_template: string, default_og_image_url: string, site_tagline: string }
  seo_defaults: model.json(),
});
