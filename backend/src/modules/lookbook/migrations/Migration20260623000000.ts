import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260623000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "lookbook_item" (' +
        '"id" text not null, ' +
        '"title" text not null, ' +
        '"description" text null, ' +
        '"image_url" text not null, ' +
        '"order_id" text null, ' +
        '"product_ids" jsonb not null default \'{}\'::jsonb, ' +
        '"tags" jsonb not null default \'{}\'::jsonb, ' +
        '"attribution" text null, ' +
        '"is_published" boolean not null default true, ' +
        '"weight" integer not null default 0, ' +
        '"created_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "lookbook_item_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_lookbook_item_is_published" on "lookbook_item" ("is_published") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_lookbook_item_weight" on "lookbook_item" ("weight") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "lookbook_item" cascade;')
  }
}
