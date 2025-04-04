"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250120110514 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250120110514 extends migrations_1.Migration {
    async up() {
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_notification_provider_deleted_at" ON "notification_provider" (deleted_at) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_notification_deleted_at" ON "notification" (deleted_at) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_notification_provider_deleted_at";');
        this.addSql('drop index if exists "IDX_notification_deleted_at";');
    }
}
exports.Migration20250120110514 = Migration20250120110514;
//# sourceMappingURL=Migration20250120110514.js.map