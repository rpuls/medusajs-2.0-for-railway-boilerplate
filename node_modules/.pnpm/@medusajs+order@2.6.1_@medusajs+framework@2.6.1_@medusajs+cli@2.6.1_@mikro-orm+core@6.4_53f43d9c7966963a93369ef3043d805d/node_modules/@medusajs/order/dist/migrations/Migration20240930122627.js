"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240930122627 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240930122627 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "order_item" add column if not exists "unit_price" numeric null, add column if not exists "raw_unit_price" jsonb null;');
    }
    async down() {
        this.addSql('alter table if exists "order_item" drop column if exists "unit_price";');
        this.addSql('alter table if exists "order_item" drop column if exists "raw_unit_price";');
    }
}
exports.Migration20240930122627 = Migration20240930122627;
//# sourceMappingURL=Migration20240930122627.js.map