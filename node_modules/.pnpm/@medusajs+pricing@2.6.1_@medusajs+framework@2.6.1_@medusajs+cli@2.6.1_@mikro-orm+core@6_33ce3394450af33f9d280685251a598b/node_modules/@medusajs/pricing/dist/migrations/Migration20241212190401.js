"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241212190401 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241212190401 extends migrations_1.Migration {
    async up() {
        this.addSql(`UPDATE price_list_rule SET attribute = 'customer.groups.id' WHERE attribute = 'customer_group_id';`);
    }
    async down() { }
}
exports.Migration20241212190401 = Migration20241212190401;
//# sourceMappingURL=Migration20241212190401.js.map