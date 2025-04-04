"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241129124827 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241129124827 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "order_address" add column if not exists "deleted_at" timestamptz null;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_address_deleted_at" ON "order_address" (deleted_at) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql(`
       ALTER TABLE "order_address" DROP COLUMN if exists "deleted_at";
    `);
    }
}
exports.Migration20241129124827 = Migration20241129124827;
//# sourceMappingURL=Migration20241129124827.js.map