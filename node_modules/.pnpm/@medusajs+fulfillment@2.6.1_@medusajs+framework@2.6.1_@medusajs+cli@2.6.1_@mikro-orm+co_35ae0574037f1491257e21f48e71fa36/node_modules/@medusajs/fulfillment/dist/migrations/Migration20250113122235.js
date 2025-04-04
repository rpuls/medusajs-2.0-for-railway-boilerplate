"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250113122235 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250113122235 extends migrations_1.Migration {
    async up() {
        this.addSql(`
      UPDATE shipping_option_rule
      SET value = '"true"'
      WHERE value = '"\\"true\\""';
    `);
        this.addSql(`
      UPDATE shipping_option_rule
      SET value = '"false"'
      WHERE value = '"\\"false\\""';
    `);
    }
    async down() {
        this.addSql(`
      UPDATE shipping_option_rule
      SET value = '"\\"true\\""'
      WHERE value = '"true"';
    `);
        this.addSql(`
      UPDATE shipping_option_rule
      SET value = '"\\"false\\""'
      WHERE value = '"false"';
    `);
    }
}
exports.Migration20250113122235 = Migration20250113122235;
//# sourceMappingURL=Migration20250113122235.js.map