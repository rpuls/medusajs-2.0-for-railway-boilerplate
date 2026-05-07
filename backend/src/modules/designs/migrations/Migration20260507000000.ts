import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260507000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "design" (' +
        '"id" text not null, ' +
        '"customer_id" text not null, ' +
        '"name" text not null, ' +
        '"thumbnail_url" text null, ' +
        '"base_product_id" text null, ' +
        '"base_variant_id" text null, ' +
        '"customizer_metadata" jsonb not null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "design_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_design_customer_id" on "design" ("customer_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_design_deleted_at" on "design" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "design" cascade;')
  }
}
