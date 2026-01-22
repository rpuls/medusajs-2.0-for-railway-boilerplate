import { Migration } from '@mikro-orm/migrations';

export class Migration20260122140745 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "variant_sales" drop constraint if exists "variant_sales_variant_id_unique";`);
    this.addSql(`create table if not exists "variant_sales" ("id" text not null, "variant_id" text not null, "selling_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "variant_sales_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_variant_sales_variant_id_unique" ON "variant_sales" (variant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_variant_sales_deleted_at" ON "variant_sales" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "variant_sales" cascade;`);
  }

}
