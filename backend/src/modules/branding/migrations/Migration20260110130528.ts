import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260110130528 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "branding_config" alter column "site_title" type text using ("site_title"::text);`);
    this.addSql(`alter table if exists "branding_config" alter column "site_title" drop not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "copyright_text" type text using ("copyright_text"::text);`);
    this.addSql(`alter table if exists "branding_config" alter column "copyright_text" drop not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "logos" type jsonb using ("logos"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "logos" drop not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "social_links" type jsonb using ("social_links"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "social_links" drop not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "contact_info" type jsonb using ("contact_info"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "contact_info" drop not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "carousel_slides" type jsonb using ("carousel_slides"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "carousel_slides" drop not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "seo_defaults" type jsonb using ("seo_defaults"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "seo_defaults" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "branding_config" alter column "site_title" type text using ("site_title"::text);`);
    this.addSql(`alter table if exists "branding_config" alter column "site_title" set not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "copyright_text" type text using ("copyright_text"::text);`);
    this.addSql(`alter table if exists "branding_config" alter column "copyright_text" set not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "logos" type jsonb using ("logos"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "logos" set not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "social_links" type jsonb using ("social_links"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "social_links" set not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "contact_info" type jsonb using ("contact_info"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "contact_info" set not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "carousel_slides" type jsonb using ("carousel_slides"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "carousel_slides" set not null;`);
    this.addSql(`alter table if exists "branding_config" alter column "seo_defaults" type jsonb using ("seo_defaults"::jsonb);`);
    this.addSql(`alter table if exists "branding_config" alter column "seo_defaults" set not null;`);
  }

}
