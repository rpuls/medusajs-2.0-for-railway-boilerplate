"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250120110744 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250120110744 extends migrations_1.Migration {
    async up() {
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_region_deleted_at" ON "region" (deleted_at) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_region_country_region_id" ON "region_country" (region_id) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_region_country_deleted_at" ON "region_country" (deleted_at) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_region_deleted_at";');
        this.addSql('drop index if exists "IDX_region_country_region_id";');
        this.addSql('drop index if exists "IDX_region_country_deleted_at";');
    }
}
exports.Migration20250120110744 = Migration20250120110744;
//# sourceMappingURL=Migration20250120110744.js.map