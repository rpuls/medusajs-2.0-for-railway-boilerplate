"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241216183049 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241216183049 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "cart_line_item_tax_line" alter column "rate" type real using ("rate"::real);');
        this.addSql('alter table if exists "cart_shipping_method_tax_line" alter column "rate" type real using ("rate"::real);');
    }
}
exports.Migration20241216183049 = Migration20241216183049;
//# sourceMappingURL=Migration20241216183049.js.map