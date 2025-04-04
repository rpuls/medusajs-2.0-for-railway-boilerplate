"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241127223829 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241127223829 extends migrations_1.Migration {
    async up() {
        this.addSql('drop index if exists "IDX_price_rule_price_id_attribute_unique";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_price_rule_price_id_attribute_operator_unique" ON "price_rule" (price_id, attribute, operator) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_price_rule_price_id_attribute_operator_unique";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_price_rule_price_id_attribute_unique" ON "price_rule" (price_id, attribute) WHERE deleted_at IS NULL;');
    }
}
exports.Migration20241127223829 = Migration20241127223829;
//# sourceMappingURL=Migration20241127223829.js.map