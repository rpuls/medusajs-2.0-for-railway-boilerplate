"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240715174100 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240715174100 extends migrations_1.Migration {
    async up() {
        const sql = `
      DROP INDEX IF EXISTS "IDX_order_shipping_method_shipping_option_id";

      ALTER TABLE "order_shipping_method"
        ADD COLUMN if NOT exists "deleted_at" timestamptz NULL;

      CREATE INDEX IF NOT EXISTS "IDX_order_shipping_method_shipping_option_id" ON "order_shipping_method" (
          shipping_option_id
      ) WHERE deleted_at IS NULL;
    `;
        this.addSql(sql);
    }
}
exports.Migration20240715174100 = Migration20240715174100;
//# sourceMappingURL=Migration20240715174100.js.map