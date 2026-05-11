import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260511000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "brand" (' +
        '"id" text not null, ' +
        '"name" text not null, ' +
        '"handle" text not null, ' +
        '"description" text null, ' +
        '"logo_url" text null, ' +
        '"external_code" text null, ' +
        '"parent_id" text null, ' +
        '"is_active" boolean not null default true, ' +
        '"metadata" jsonb null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "brand_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create unique index if not exists "IDX_brand_handle_unique" on "brand" ("handle") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_brand_name" on "brand" ("name") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_brand_parent_id" on "brand" ("parent_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_brand_external_code" on "brand" ("external_code") where "deleted_at" is null and "external_code" is not null;'
    )
    this.addSql(
      'create index if not exists "IDX_brand_deleted_at" on "brand" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "brand" cascade;')
  }
}
