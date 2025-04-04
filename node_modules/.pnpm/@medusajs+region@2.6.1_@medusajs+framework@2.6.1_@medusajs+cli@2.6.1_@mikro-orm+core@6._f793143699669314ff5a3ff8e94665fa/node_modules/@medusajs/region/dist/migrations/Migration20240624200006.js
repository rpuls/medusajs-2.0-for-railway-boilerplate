"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240624200006 = void 0;
const utils_1 = require("@medusajs/framework/utils");
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240624200006 extends migrations_1.Migration {
    async up() {
        this.addSql('ALTER TABLE IF EXISTS "region_country" ADD COLUMN IF NOT EXISTS "metadata" jsonb null, ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT NOW(), ADD COLUMN "updated_at" timestamptz NOT NULL DEFAULT NOW(), ADD COLUMN "deleted_at" timestamptz NULL;');
        this.addSql((0, utils_1.generatePostgresAlterColummnIfExistStatement)("region_country", ["region_id"], `DROP NOT NULL`));
    }
    async down() {
        this.addSql('ALTER TABLE IF EXISTS "region_country" DROP COLUMN IF EXISTS "metadata";');
        this.addSql('ALTER TABLE IF EXISTS "region_country" DROP COLUMN IF EXISTS "created_at";');
        this.addSql('ALTER TABLE IF EXISTS "region_country" DROP COLUMN IF EXISTS "updated_at";');
        this.addSql('ALTER TABLE IF EXISTS "region_country" DROP COLUMN IF EXISTS "deleted_at";');
        this.addSql((0, utils_1.generatePostgresAlterColummnIfExistStatement)("region_country", ["region_id"], `SET NOT NULL`));
    }
}
exports.Migration20240624200006 = Migration20240624200006;
//# sourceMappingURL=Migration20240624200006.js.map