"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240624082354 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240624082354 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "currency" add column if not exists "deleted_at" timestamptz null;');
    }
    async down() {
        this.addSql('alter table if exists "currency" drop column if exists "deleted_at";');
    }
}
exports.Migration20240624082354 = Migration20240624082354;
//# sourceMappingURL=Migration20240624082354.js.map