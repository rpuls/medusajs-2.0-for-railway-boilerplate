import { Migration } from '@mikro-orm/migrations';

export class Migration20260122155312 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_sales" add column if not exists "category_id" text null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_category_id" ON "product_sales" (category_id) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_product_sales_category_id";`);
    this.addSql(`alter table if exists "product_sales" drop column if exists "category_id";`);
  }

}
