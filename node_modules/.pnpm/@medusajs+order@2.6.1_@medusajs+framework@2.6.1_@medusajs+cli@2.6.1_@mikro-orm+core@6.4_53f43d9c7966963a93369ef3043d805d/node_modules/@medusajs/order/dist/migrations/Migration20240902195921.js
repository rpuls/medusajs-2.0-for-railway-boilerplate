"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240902195921 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240902195921 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "order_line_item" add column if not exists "is_custom_price" boolean not null default false;');
        this.addSql('alter table if exists "order_shipping_method" add column if not exists "is_custom_amount" boolean not null default false;');
    }
    async down() {
        this.addSql('alter table if exists "order_line_item" drop column if exists "is_custom_price";');
        this.addSql('alter table if exists "order_shipping_method" drop column if exists "is_custom_amount";');
    }
}
exports.Migration20240902195921 = Migration20240902195921;
//# sourceMappingURL=Migration20240902195921.js.map