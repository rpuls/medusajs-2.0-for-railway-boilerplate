"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250120110552 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250120110552 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "payment" drop constraint if exists "payment_payment_session_id_unique";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_payment_session_id_unique" ON "payment" (payment_session_id) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_payment_payment_session_id_unique";');
        this.addSql('alter table if exists "payment" add constraint "payment_payment_session_id_unique" unique ("payment_session_id");');
    }
}
exports.Migration20250120110552 = Migration20250120110552;
//# sourceMappingURL=Migration20250120110552.js.map