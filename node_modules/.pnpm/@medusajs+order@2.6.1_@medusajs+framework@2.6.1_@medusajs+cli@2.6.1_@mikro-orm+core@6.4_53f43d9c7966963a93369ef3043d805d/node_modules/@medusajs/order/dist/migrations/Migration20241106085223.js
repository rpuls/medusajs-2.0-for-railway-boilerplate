"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241106085223 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241106085223 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "order_line_item" add column if not exists "product_type_id" text null;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_line_item_product_type_id" ON "order_line_item" (product_type_id) WHERE deleted_at IS NOT NULL AND product_type_id IS NOT NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_line_item_product_type_id";');
        this.addSql('alter table if exists "order_line_item" drop column if exists "product_type_id";');
    }
}
exports.Migration20241106085223 = Migration20241106085223;
//# sourceMappingURL=Migration20241106085223.js.map