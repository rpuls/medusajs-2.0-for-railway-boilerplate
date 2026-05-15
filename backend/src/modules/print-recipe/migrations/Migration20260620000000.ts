import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260620000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "print_recipe" (' +
        '"id" text not null, ' +
        '"name" text not null, ' +
        '"description" text null, ' +
        '"decoration_method" text not null default \'screen_print\', ' +
        '"product_id" text null, ' +
        '"variant_id" text null, ' +
        '"design_id" text null, ' +
        '"customer_id" text null, ' +
        '"last_used_order_id" text null, ' +
        '"last_used_at" timestamptz null, ' +
        '"recipe_json" jsonb not null default \'{}\'::jsonb, ' +
        '"notes" text null, ' +
        '"is_archived" boolean not null default false, ' +
        '"created_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "print_recipe_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_print_recipe_decoration_method" on "print_recipe" ("decoration_method") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_print_recipe_product_id" on "print_recipe" ("product_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_print_recipe_customer_id" on "print_recipe" ("customer_id") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "print_recipe" cascade;')
  }
}
