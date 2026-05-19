import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260519000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "bottle_shop" (' +
        '"id" text not null, ' +
        '"name" text not null, ' +
        '"handle" text not null, ' +
        '"email" text null, ' +
        '"contact_name" text null, ' +
        '"phone" text null, ' +
        '"address_line_1" text null, ' +
        '"address_line_2" text null, ' +
        '"city" text null, ' +
        '"state" text null, ' +
        '"postal_code" text null, ' +
        '"country_code" text null, ' +
        '"notes" text null, ' +
        '"is_active" boolean not null default true, ' +
        '"metadata" jsonb null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "bottle_shop_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create unique index if not exists "IDX_bottle_shop_handle_unique" on "bottle_shop" ("handle") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_bottle_shop_name" on "bottle_shop" ("name") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_bottle_shop_deleted_at" on "bottle_shop" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "bottle_shop" cascade;')
  }
}
