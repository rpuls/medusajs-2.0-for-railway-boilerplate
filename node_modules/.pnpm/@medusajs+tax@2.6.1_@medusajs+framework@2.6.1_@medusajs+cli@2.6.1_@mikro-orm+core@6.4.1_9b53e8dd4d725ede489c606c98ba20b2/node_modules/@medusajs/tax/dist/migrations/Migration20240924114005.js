"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240924114005 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240924114005 extends migrations_1.Migration {
    async up() {
        this.addSql(`UPDATE "tax_rate" SET code = 'default' WHERE code IS NULL;`);
        this.addSql(`ALTER TABLE IF EXISTS "tax_rate" ALTER COLUMN "code" SET NOT NULL;`);
    }
    async down() {
        this.addSql(`ALTER TABLE IF EXISTS "tax_rate" ALTER COLUMN "code" DROP NOT NULL;`);
    }
}
exports.Migration20240924114005 = Migration20240924114005;
//# sourceMappingURL=Migration20240924114005.js.map