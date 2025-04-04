"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241206083313 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241206083313 extends migrations_1.Migration {
    async up() {
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_store_currency_store_id" ON "store_currency" (store_id) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_store_currency_store_id";');
    }
}
exports.Migration20241206083313 = Migration20241206083313;
//# sourceMappingURL=Migration20241206083313.js.map