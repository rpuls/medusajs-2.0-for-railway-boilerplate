"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration202408271511 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration202408271511 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "product_category" add column if not exists "metadata" jsonb;');
    }
    async down() {
        this.addSql('alter table if exists "product_category" drop column if exists "metadata";');
    }
}
exports.Migration202408271511 = Migration202408271511;
//# sourceMappingURL=Migration202408271511.js.map