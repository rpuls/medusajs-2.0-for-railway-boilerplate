import { z } from "zod";

// Logo schema
const LogoSchema = z.object({
  url: z.string().url().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Social link schema
const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

// Contact info schema
const ContactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Carousel slide schema
const CarouselSlideSchema = z.object({
  image_url: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  link_url: z.string().url().optional(),
  link_text: z.string().optional(),
  order: z.number().optional(),
});

// SEO defaults schema
const SeoDefaultsSchema = z.object({
  meta_description_template: z.string().optional(),
  default_og_image_url: z.string().url().optional(),
  site_tagline: z.string().optional(),
});

// Logos object schema
const LogosSchema = z.object({
  main: LogoSchema.optional(),
  footer: LogoSchema.optional(),
  favicon: LogoSchema.optional(),
});

export const PostAdminUpdateBranding = z.object({
  site_title: z.string().optional(),
  copyright_text: z.string().optional(),
  logos: LogosSchema.optional().nullable(),
  social_links: z.array(SocialLinkSchema).optional(),
  contact_info: ContactInfoSchema.optional().nullable(),
  carousel_slides: z.array(CarouselSlideSchema).optional(),
  seo_defaults: SeoDefaultsSchema.optional().nullable(),
});

export type PostAdminUpdateBrandingType = z.infer<
  typeof PostAdminUpdateBranding
>;
