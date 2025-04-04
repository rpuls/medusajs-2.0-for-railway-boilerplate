"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240831125857 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240831125857 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "cart" add column if not exists "completed_at" timestamptz null;');
    }
    async down() {
        this.addSql('alter table if exists "cart" drop column if exists "completed_at";');
    }
}
exports.Migration20240831125857 = Migration20240831125857;
//# sourceMappingURL=Migration20240831125857.js.map