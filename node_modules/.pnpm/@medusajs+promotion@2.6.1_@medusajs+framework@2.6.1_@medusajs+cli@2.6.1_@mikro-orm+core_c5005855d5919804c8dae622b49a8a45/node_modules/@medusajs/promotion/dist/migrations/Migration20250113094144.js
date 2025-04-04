"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250113094144 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250113094144 extends migrations_1.Migration {
    async up() {
        this.addSql("alter table if exists \"promotion\" add column if not exists \"status\" text check (\"status\" in ('draft', 'active', 'inactive')) not null default 'draft';");
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_promotion_status" ON "promotion" (status) WHERE deleted_at IS NULL;');
        // Data Migration
        this.addSql(`UPDATE promotion SET status = 'active';`);
    }
    async down() {
        this.addSql('drop index if exists "IDX_promotion_status";');
        this.addSql('alter table if exists "promotion" drop column if exists "status";');
    }
}
exports.Migration20250113094144 = Migration20250113094144;
//# sourceMappingURL=Migration20250113094144.js.map