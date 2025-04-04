"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240601111544 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240601111544 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "product_category" alter column "rank" type integer using ("rank"::integer);');
        this.addSql('alter table if exists "product_variant" alter column "variant_rank" type integer using ("variant_rank"::integer);');
    }
    async down() {
        this.addSql('alter table if exists "product_category" alter column "rank" type numeric using ("rank"::numeric);');
        this.addSql('alter table if exists "product_variant" alter column "variant_rank" type numeric using ("variant_rank"::numeric);');
    }
}
exports.Migration20240601111544 = Migration20240601111544;
//# sourceMappingURL=Migration20240601111544.js.map