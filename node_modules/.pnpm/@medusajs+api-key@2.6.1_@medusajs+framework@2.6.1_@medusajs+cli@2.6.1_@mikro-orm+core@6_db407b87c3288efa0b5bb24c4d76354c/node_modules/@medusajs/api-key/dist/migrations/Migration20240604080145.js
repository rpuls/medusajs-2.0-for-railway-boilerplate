"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240604080145 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240604080145 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "api_key" add column if not exists "updated_at" timestamptz not null default now();');
    }
    async down() {
        this.addSql('alter table if exists "api_key" drop column if exists "updated_at";');
    }
}
exports.Migration20240604080145 = Migration20240604080145;
//# sourceMappingURL=Migration20240604080145.js.map