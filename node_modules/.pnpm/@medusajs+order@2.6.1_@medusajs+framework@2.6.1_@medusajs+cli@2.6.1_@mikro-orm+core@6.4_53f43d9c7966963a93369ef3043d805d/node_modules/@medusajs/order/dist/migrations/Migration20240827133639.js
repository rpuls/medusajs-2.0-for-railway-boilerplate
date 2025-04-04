"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240827133639 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240827133639 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "return_item" add column if not exists "damaged_quantity" numeric not null default 0, add column if not exists "raw_damaged_quantity" jsonb;');
        this.addSql(`UPDATE "return_item" SET raw_damaged_quantity = '{"value": "0", "precision": 20}'::jsonb;`);
        this.addSql('ALTER TABLE IF EXISTS "return_item" ALTER COLUMN "raw_damaged_quantity" SET NOT NULL;');
    }
    async down() {
        this.addSql('alter table if exists "return_item" drop column if exists "damaged_quantity";');
        this.addSql('alter table if exists "return_item" drop column if exists "raw_damaged_quantity";');
    }
}
exports.Migration20240827133639 = Migration20240827133639;
//# sourceMappingURL=Migration20240827133639.js.map