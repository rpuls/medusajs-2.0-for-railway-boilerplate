"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241202103352 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241202103352 extends migrations_1.Migration {
    async up() {
        this.addSql('drop index if exists "IDX_invite_email";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invite_email_unique" ON "invite" (email) WHERE deleted_at IS NULL;');
        this.addSql('drop index if exists "IDX_user_email";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_email_unique" ON "user" (email) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_invite_email_unique";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invite_email" ON "invite" (email) WHERE deleted_at IS NULL;');
        this.addSql('drop index if exists "IDX_user_email_unique";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_email" ON "user" (email) WHERE deleted_at IS NULL;');
    }
}
exports.Migration20241202103352 = Migration20241202103352;
//# sourceMappingURL=Migration20241202103352.js.map