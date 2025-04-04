"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240917161003 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240917161003 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "fulfillment" add column if not exists "requires_shipping" boolean not null default true;');
    }
    async down() {
        this.addSql('alter table if exists "fulfillment" drop column if exists "requires_shipping";');
    }
}
exports.Migration20240917161003 = Migration20240917161003;
//# sourceMappingURL=Migration20240917161003.js.map