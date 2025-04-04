"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240821170920 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240821170920 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "return" add column if not exists "created_by" text null;');
        this.addSql('alter table if exists "order_exchange" add column if not exists "created_by" text null;');
        this.addSql('alter table if exists "order_claim" add column if not exists "created_by" text null;');
    }
    async down() {
        this.addSql('alter table if exists "return" drop column if exists "created_by";');
        this.addSql('alter table if exists "order_exchange" drop column if exists "created_by";');
        this.addSql('alter table if exists "order_claim" drop column if exists "created_by";');
    }
}
exports.Migration20240821170920 = Migration20240821170920;
//# sourceMappingURL=Migration20240821170920.js.map