import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260617000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "design_version" (' +
        '"id" text not null, ' +
        '"design_id" text not null, ' +
        '"customer_id" text not null, ' +
        '"version" integer not null, ' +
        '"name" text not null, ' +
        '"thumbnail_url" text null, ' +
        '"base_product_id" text null, ' +
        '"base_variant_id" text null, ' +
        '"customizer_metadata" jsonb not null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "design_version_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_design_version_design_id" on "design_version" ("design_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_design_version_customer_id" on "design_version" ("customer_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create unique index if not exists "IDX_design_version_design_version" on "design_version" ("design_id", "version") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_design_version_deleted_at" on "design_version" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "design_version" cascade;')
  }
}
