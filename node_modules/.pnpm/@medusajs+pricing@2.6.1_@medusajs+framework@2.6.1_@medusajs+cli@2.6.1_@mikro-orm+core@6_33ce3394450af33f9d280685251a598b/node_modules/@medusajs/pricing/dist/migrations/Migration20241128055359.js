"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241128055359 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241128055359 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "price_list" alter column "rules_count" type integer using ("rules_count"::integer);');
        this.addSql('alter table if exists "price_list" alter column "rules_count" drop not null;');
        this.addSql('alter table if exists "price" alter column "min_quantity" type integer using ("min_quantity"::integer);');
        this.addSql('alter table if exists "price" alter column "max_quantity" type integer using ("max_quantity"::integer);');
        this.addSql('alter table if exists "price" alter column "rules_count" type integer using ("rules_count"::integer);');
        this.addSql('alter table if exists "price" alter column "rules_count" drop not null;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_price_rule_price_id" ON "price_rule" (price_id) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('alter table if exists "price_list" alter column "rules_count" type integer using ("rules_count"::integer);');
        this.addSql('alter table if exists "price_list" alter column "rules_count" set not null;');
        this.addSql('alter table if exists "price" alter column "min_quantity" type numeric using ("min_quantity"::numeric);');
        this.addSql('alter table if exists "price" alter column "max_quantity" type numeric using ("max_quantity"::numeric);');
        this.addSql('alter table if exists "price" alter column "rules_count" type integer using ("rules_count"::integer);');
        this.addSql('alter table if exists "price" alter column "rules_count" set not null;');
        this.addSql('drop index if exists "IDX_price_rule_price_id";');
    }
}
exports.Migration20241128055359 = Migration20241128055359;
//# sourceMappingURL=Migration20241128055359.js.map