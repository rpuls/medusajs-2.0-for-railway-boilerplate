"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240716081800 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240716081800 extends migrations_1.Migration {
    async up() {
        const sql = `
      DROP INDEX IF EXISTS "IDX_order_line_item_variant_id";
      DROP INDEX IF EXISTS "IDX_order_line_item_product_id";

      ALTER TABLE "order_line_item"
        ADD COLUMN if NOT exists "deleted_at" timestamptz NULL;

      CREATE INDEX IF NOT EXISTS "IDX_order_line_item_variant_id" ON "order_line_item" (
          variant_id
      ) WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS "IDX_order_line_item_product_id" ON "order_line_item" (
          product_id
      ) WHERE deleted_at IS NULL;



      DROP INDEX IF EXISTS "IDX_order_shipping_method_tax_line_shipping_method_id";

      ALTER TABLE "order_shipping_method_tax_line"
        ADD COLUMN if NOT exists "deleted_at" timestamptz NULL;

      CREATE INDEX IF NOT EXISTS "IDX_order_shipping_method_tax_line_shipping_method_id" ON "order_shipping_method_tax_line" (
          shipping_method_id
      ) WHERE deleted_at IS NULL;


      DROP INDEX IF EXISTS "IDX_order_shipping_method_adjustment_shipping_method_id";

      ALTER TABLE "order_shipping_method_adjustment"
        ADD COLUMN if NOT exists "deleted_at" timestamptz NULL;

      CREATE INDEX IF NOT EXISTS "IDX_order_shipping_method_adjustment_shipping_method_id" ON "order_shipping_method_adjustment" (
          shipping_method_id
      ) WHERE deleted_at IS NULL;



      DROP INDEX IF EXISTS "IDX_order_line_item_tax_line_item_id";

      ALTER TABLE "order_line_item_tax_line"
        ADD COLUMN if NOT exists "deleted_at" timestamptz NULL;

      CREATE INDEX IF NOT EXISTS "IDX_order_line_item_tax_line_item_id" ON "order_line_item_tax_line" (
        item_id
      ) WHERE deleted_at IS NULL;

      DROP INDEX IF EXISTS "IDX_order_line_item_adjustment_item_id";

      ALTER TABLE "order_line_item_adjustment"
        ADD COLUMN if NOT exists "deleted_at" timestamptz NULL;

      CREATE INDEX IF NOT EXISTS "IDX_order_line_item_adjustment_item_id" ON "order_line_item_adjustment" (
        item_id
      ) WHERE deleted_at IS NULL;
    `;
        this.addSql(sql);
    }
}
exports.Migration20240716081800 = Migration20240716081800;
//# sourceMappingURL=Migration20240716081800.js.map