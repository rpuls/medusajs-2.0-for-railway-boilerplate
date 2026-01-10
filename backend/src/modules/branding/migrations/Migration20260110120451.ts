import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260110120451 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "branding_config" ("id" text not null, "site_title" text not null, "copyright_text" text not null, "logos" jsonb not null, "social_links" jsonb not null, "contact_info" jsonb not null, "carousel_slides" jsonb not null, "seo_defaults" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "branding_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_branding_config_deleted_at" ON "branding_config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "branding_config" cascade;`);
  }

}
