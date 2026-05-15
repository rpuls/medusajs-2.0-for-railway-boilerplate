import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260515000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "bundle" (' +
        '"id" text not null, ' +
        '"title" text not null, ' +
        '"handle" text not null, ' +
        '"subtitle" text null, ' +
        '"status" text not null default \'active\', ' +
        '"thumbnail_url" text null, ' +
        '"quantity_multiplier_label" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "bundle_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create unique index if not exists "IDX_bundle_handle" on "bundle" ("handle") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_bundle_status" on "bundle" ("status") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_bundle_deleted_at" on "bundle" ("deleted_at") where "deleted_at" is not null;'
    )

    this.addSql(
      'create table if not exists "bundle_item" (' +
        '"id" text not null, ' +
        '"bundle_id" text not null, ' +
        '"product_handle" text not null, ' +
        '"label" text not null, ' +
        '"quantity_per_unit" integer not null default 1, ' +
        '"decoration_type" text not null default \'embroidery\', ' +
        '"position" integer not null default 0, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "bundle_item_pkey" primary key ("id"), ' +
        'constraint "bundle_item_bundle_id_fkey" foreign key ("bundle_id") references "bundle" ("id") on delete cascade' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_bundle_item_bundle_id" on "bundle_item" ("bundle_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_bundle_item_deleted_at" on "bundle_item" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "bundle_item" cascade;')
    this.addSql('drop table if exists "bundle" cascade;')
  }
}
