"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240715102100 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240715102100 extends migrations_1.Migration {
    async up() {
        const sql = `
      ALTER TABLE "return"
        ADD COLUMN if NOT exists "location_id" TEXT NULL;
    `;
        this.addSql(sql);
    }
}
exports.Migration20240715102100 = Migration20240715102100;
//# sourceMappingURL=Migration20240715102100.js.map