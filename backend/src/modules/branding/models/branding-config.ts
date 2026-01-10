import { model } from "@medusajs/framework/utils";

export const BrandingConfig = model.define("branding_config", {
  id: model.id().primaryKey(),
  // Site title
  site_title: model.text().nullable(),

  // Copyright text
  copyright_text: model.text().nullable(),

  // Logos stored as JSON: { main: { url, alt, width, height }, footer: {...}, favicon: {...} }
  logos: model.json().nullable(),

  // Social links stored as JSON array: [{ platform: string, url: string }]
  social_links: model.json().nullable(),

  // Contact info stored as JSON: { email: string, phone: string, address: string }
  contact_info: model.json().nullable(),

  // Carousel slides stored as JSON array
  carousel_slides: model.json().nullable(),

  // SEO defaults stored as JSON: { meta_description_template: string, default_og_image_url: string, site_tagline: string }
  seo_defaults: model.json().nullable(),
});
