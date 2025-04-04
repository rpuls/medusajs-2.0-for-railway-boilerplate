"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241202100304 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241202100304 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "auth_identity" add column if not exists "deleted_at" timestamptz null;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_auth_identity_deleted_at" ON "auth_identity" (deleted_at) WHERE deleted_at IS NULL;');
        this.addSql('alter table if exists "provider_identity" add column if not exists "deleted_at" timestamptz null;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_provider_identity_deleted_at" ON "provider_identity" (deleted_at) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_auth_identity_deleted_at";');
        this.addSql('alter table if exists "auth_identity" drop column if exists "deleted_at";');
        this.addSql('drop index if exists "IDX_provider_identity_deleted_at";');
        this.addSql('alter table if exists "provider_identity" drop column if exists "deleted_at";');
    }
}
exports.Migration20241202100304 = Migration20241202100304;
//# sourceMappingURL=Migration20241202100304.js.map