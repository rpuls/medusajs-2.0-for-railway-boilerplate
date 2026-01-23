import { Migration } from '@mikro-orm/migrations';

export class Migration20260122141755 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_sales" drop constraint if exists "product_sales_product_id_unique";`);
    this.addSql(`create table if not exists "product_sales" ("id" text not null, "product_id" text not null, "selling_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_sales_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_sales_product_id_unique" ON "product_sales" (product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_deleted_at" ON "product_sales" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_sales" cascade;`);
  }

}
