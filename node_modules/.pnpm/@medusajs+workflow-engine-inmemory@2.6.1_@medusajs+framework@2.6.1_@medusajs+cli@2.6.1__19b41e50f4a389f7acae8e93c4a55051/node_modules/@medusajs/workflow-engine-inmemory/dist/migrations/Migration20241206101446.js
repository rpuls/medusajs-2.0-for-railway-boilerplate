"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241206101446 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241206101446 extends migrations_1.Migration {
    async up() {
        this.addSql(`DROP INDEX IF EXISTS "IDX_workflow_execution_id";
      DROP INDEX IF EXISTS "IDX_workflow_execution_workflow_id";
      DROP INDEX IF EXISTS "IDX_workflow_execution_transaction_id";
      DROP INDEX IF EXISTS "IDX_workflow_execution_state";`);
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_deleted_at" ON "workflow_execution" (deleted_at) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_id" ON "workflow_execution" (id) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_workflow_id" ON "workflow_execution" (workflow_id) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_transaction_id" ON "workflow_execution" (transaction_id) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_state" ON "workflow_execution" (state) WHERE deleted_at IS NULL;');
    }
}
exports.Migration20241206101446 = Migration20241206101446;
//# sourceMappingURL=Migration20241206101446.js.map