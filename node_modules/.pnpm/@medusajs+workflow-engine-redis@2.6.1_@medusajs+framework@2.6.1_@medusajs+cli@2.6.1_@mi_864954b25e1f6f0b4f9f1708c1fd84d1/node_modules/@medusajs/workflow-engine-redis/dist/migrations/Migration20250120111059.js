"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250120111059 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250120111059 extends migrations_1.Migration {
    async up() {
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_workflow_execution_workflow_id_transaction_id_unique" ON "workflow_execution" (workflow_id, transaction_id) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_workflow_execution_workflow_id_transaction_id_unique";');
    }
}
exports.Migration20250120111059 = Migration20250120111059;
//# sourceMappingURL=Migration20250120111059.js.map