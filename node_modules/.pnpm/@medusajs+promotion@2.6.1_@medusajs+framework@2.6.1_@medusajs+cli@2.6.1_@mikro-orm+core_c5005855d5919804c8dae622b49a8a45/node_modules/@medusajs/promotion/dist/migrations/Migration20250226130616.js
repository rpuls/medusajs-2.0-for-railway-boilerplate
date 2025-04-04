"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250226130616 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250226130616 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "promotion" drop constraint if exists "IDX_promotion_code_unique";');
        this.addSql(`drop index if exists "IDX_promotion_code_unique";`);
        this.addSql(`drop index if exists "IDX_promotion_code";`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_unique_promotion_code" ON "promotion" (code) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop index if exists "IDX_unique_promotion_code";`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_promotion_code_unique" ON "promotion" (code) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_promotion_code" ON "promotion" (code) WHERE deleted_at IS NULL;`);
        this.addSql('alter table if exists "promotion" add constraint "IDX_promotion_code_unique" unique ("code");');
    }
}
exports.Migration20250226130616 = Migration20250226130616;
//# sourceMappingURL=Migration20250226130616.js.map