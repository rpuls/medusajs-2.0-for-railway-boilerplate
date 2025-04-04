"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240602110946 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240602110946 extends migrations_1.Migration {
    async up() {
        this.addSql('ALTER TABLE IF EXISTS "customer_group" ALTER COLUMN "name" SET NOT NULL;');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_group_name_unique" ON "customer_group" (name) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('ALTER TABLE IF EXISTS "customer_group" ALTER COLUMN "name" DROP NOT NULL;');
        this.addSql('drop index if exists "IDX_customer_group_name_unique";');
    }
}
exports.Migration20240602110946 = Migration20240602110946;
//# sourceMappingURL=Migration20240602110946.js.map