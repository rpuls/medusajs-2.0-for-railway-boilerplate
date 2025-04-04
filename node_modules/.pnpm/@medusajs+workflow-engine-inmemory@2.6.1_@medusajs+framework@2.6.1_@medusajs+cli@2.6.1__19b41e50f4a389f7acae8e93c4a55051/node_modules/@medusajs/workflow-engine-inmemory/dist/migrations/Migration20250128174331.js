"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250128174331 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250128174331 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "workflow_execution" add column if not exists "retention_time" integer null;`);
        this.addSql(`
      UPDATE workflow_execution
      SET retention_time = (
        SELECT COALESCE(
          (execution->'options'->>'retentionTime')::integer, 
          0
        )
      )
      WHERE execution->'options' ? 'retentionTime';
    `);
    }
    async down() {
        this.addSql(`alter table if exists "workflow_execution" drop column if exists "retention_time";`);
    }
}
exports.Migration20250128174331 = Migration20250128174331;
//# sourceMappingURL=Migration20250128174331.js.map