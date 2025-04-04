"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240830094712 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240830094712 extends migrations_1.Migration {
    async up() {
        this.addSql("alter table if exists \"notification\" add column if not exists \"status\" text check (\"status\" in ('pending', 'success', 'failure')) not null default 'pending';");
    }
    async down() {
        this.addSql('alter table if exists "notification" drop column if exists "status";');
    }
}
exports.Migration20240830094712 = Migration20240830094712;
//# sourceMappingURL=Migration20240830094712.js.map