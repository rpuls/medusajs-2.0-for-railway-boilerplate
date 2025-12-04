import { Migration } from '@mikro-orm/migrations';

export class Migration20251126101548 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "econt_city" ("id" text not null, "city_id" integer not null, "post_code" text not null, "type" text not null, "name" text not null, "name_en" text null, "region" text null, "region_en" text null, "zone_id" integer not null default 3, "country_id" integer not null default 1033, "office_id" integer not null default 0, "country_code" text not null default 'BG', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "econt_city_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_city_city_id" ON "econt_city" (city_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_city_post_code" ON "econt_city" (post_code) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_city_name" ON "econt_city" (name) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_city_deleted_at" ON "econt_city" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "econt_office" ("id" text not null, "office_code" text not null, "name" text not null, "name_en" text null, "address" text not null, "address_en" text null, "city_id" integer not null, "city_name" text not null, "post_code" text not null, "phone" text null, "working_time" text null, "working_time_saturday" text null, "working_time_sunday" text null, "latitude" integer null, "longitude" integer null, "is_machine" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "econt_office_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_office_office_code" ON "econt_office" (office_code) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_office_city_id" ON "econt_office" (city_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_office_deleted_at" ON "econt_office" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "econt_quarter" ("id" text not null, "city_id" integer not null, "name" text not null, "name_en" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "econt_quarter_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_quarter_city_id" ON "econt_quarter" (city_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_quarter_name" ON "econt_quarter" (name) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_quarter_deleted_at" ON "econt_quarter" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "econt_shipment" ("id" text not null, "order_id" text not null, "loading_num" text not null, "loading_id" text null, "pdf_url" text null, "is_imported" boolean not null default false, "status" text null, "tracking_data" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "econt_shipment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_shipment_order_id" ON "econt_shipment" (order_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_shipment_loading_num" ON "econt_shipment" (loading_num) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_shipment_deleted_at" ON "econt_shipment" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "econt_street" ("id" text not null, "city_id" integer not null, "name" text not null, "name_en" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "econt_street_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_street_city_id" ON "econt_street" (city_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_street_name" ON "econt_street" (name) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_street_deleted_at" ON "econt_street" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "econt_city" cascade;`);

    this.addSql(`drop table if exists "econt_office" cascade;`);

    this.addSql(`drop table if exists "econt_quarter" cascade;`);

    this.addSql(`drop table if exists "econt_shipment" cascade;`);

    this.addSql(`drop table if exists "econt_street" cascade;`);
  }

}
