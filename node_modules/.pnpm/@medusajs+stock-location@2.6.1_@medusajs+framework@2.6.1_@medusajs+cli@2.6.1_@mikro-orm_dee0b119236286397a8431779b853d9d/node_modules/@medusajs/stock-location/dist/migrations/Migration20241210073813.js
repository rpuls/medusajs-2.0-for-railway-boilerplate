"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241210073813 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241210073813 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "stock_location" drop constraint if exists "stock_location_address_id_foreign";');
        this.addSql('alter table if exists "stock_location" add constraint "stock_location_address_id_foreign" foreign key ("address_id") references "stock_location_address" ("id") on update cascade on delete cascade;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_stock_location_address_id" ON "stock_location" (address_id) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('alter table if exists "stock_location" drop constraint if exists "stock_location_address_id_foreign";');
        this.addSql('drop index if exists "IDX_stock_location_address_id";');
        this.addSql('alter table if exists "stock_location" add constraint "stock_location_address_id_foreign" foreign key ("address_id") references "stock_location_address" ("id") on update cascade on delete set null;');
    }
}
exports.Migration20241210073813 = Migration20241210073813;
//# sourceMappingURL=Migration20241210073813.js.map