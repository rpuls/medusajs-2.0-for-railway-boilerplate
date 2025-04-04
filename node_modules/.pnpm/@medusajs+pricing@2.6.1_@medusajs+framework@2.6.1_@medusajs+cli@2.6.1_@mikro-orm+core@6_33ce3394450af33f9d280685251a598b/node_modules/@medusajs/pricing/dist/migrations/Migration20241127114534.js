"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241127114534 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241127114534 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "price_rule" add column if not exists "operator" text check ("operator" in ('gte', 'lte', 'gt', 'lt', 'eq'));`);
        this.addSql(`update "price_rule" set "operator" = 'eq' where "operator" is null;`);
        this.addSql(`alter table "price_rule" alter column "operator" set not null, alter column "operator" set default 'eq';`);
        this.addSql('create index if not exists "IDX_price_rule_operator" on "price_rule" ("operator");');
    }
    async down() {
        this.addSql('drop index if exists "IDX_price_rule_operator";');
        this.addSql('alter table if exists "price_rule" drop column if exists "operator";');
    }
}
exports.Migration20241127114534 = Migration20241127114534;
//# sourceMappingURL=Migration20241127114534.js.map