"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241014142943 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241014142943 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "order_item" add column if not exists "compare_at_unit_price" numeric null, add column if not exists "raw_compare_at_unit_price" jsonb null;');
    }
    async down() {
        this.addSql('alter table if exists "order_item" drop column if exists "compare_at_unit_price";');
        this.addSql('alter table if exists "order_item" drop column if exists "raw_compare_at_unit_price";');
    }
}
exports.Migration20241014142943 = Migration20241014142943;
//# sourceMappingURL=Migration20241014142943.js.map