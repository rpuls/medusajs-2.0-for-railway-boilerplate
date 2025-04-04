"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250120110820 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250120110820 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "stock_location" drop constraint if exists "stock_location_address_id_unique";');
        this.addSql('drop index if exists "IDX_stock_location_address_id";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_stock_location_address_id_unique" ON "stock_location" (address_id) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_stock_location_address_id_unique";');
        this.addSql('alter table if exists "stock_location" add constraint "stock_location_address_id_unique" unique ("address_id");');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_stock_location_address_id" ON "stock_location" (address_id) WHERE deleted_at IS NULL;');
    }
}
exports.Migration20250120110820 = Migration20250120110820;
//# sourceMappingURL=Migration20250120110820.js.map