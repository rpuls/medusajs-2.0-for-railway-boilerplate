"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250106142624 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250106142624 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "stock_location" add constraint "stock_location_address_id_unique" unique ("address_id");');
    }
    async down() {
        this.addSql('alter table if exists "stock_location" drop constraint if exists "stock_location_address_id_unique";');
    }
}
exports.Migration20250106142624 = Migration20250106142624;
//# sourceMappingURL=Migration20250106142624.js.map