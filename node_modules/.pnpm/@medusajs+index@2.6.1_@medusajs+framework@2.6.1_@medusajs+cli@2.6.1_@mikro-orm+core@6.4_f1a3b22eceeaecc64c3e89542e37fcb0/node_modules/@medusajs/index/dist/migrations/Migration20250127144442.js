"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250127144442 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250127144442 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "index_data" add column if not exists "staled_at" timestamptz null;`);
        this.addSql(`alter table if exists "index_relation" add column if not exists "staled_at" timestamptz null;`);
    }
    async down() {
        this.addSql(`alter table if exists "index_data" drop column if exists "staled_at";`);
        this.addSql(`alter table if exists "index_relation" drop column if exists "staled_at";`);
    }
}
exports.Migration20250127144442 = Migration20250127144442;
//# sourceMappingURL=Migration20250127144442.js.map