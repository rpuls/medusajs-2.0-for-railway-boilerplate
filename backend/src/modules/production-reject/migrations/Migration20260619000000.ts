import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260619000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "production_reject" (' +
        '"id" text not null, ' +
        '"order_id" text not null, ' +
        '"order_line_item_id" text null, ' +
        '"product_id" text null, ' +
        '"variant_id" text null, ' +
        '"supplier_brand_id" text null, ' +
        '"qty" integer not null, ' +
        '"reason" text not null default \'misprint\', ' +
        '"notes" text null, ' +
        '"cost_estimate_cents" integer not null default 0, ' +
        '"currency_code" text not null default \'aud\', ' +
        '"logged_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "production_reject_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_production_reject_order_id" on "production_reject" ("order_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_production_reject_reason" on "production_reject" ("reason") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_production_reject_supplier_brand_id" on "production_reject" ("supplier_brand_id") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "production_reject" cascade;')
  }
}
