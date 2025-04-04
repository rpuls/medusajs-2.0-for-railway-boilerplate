"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240628075401 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240628075401 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "notification_provider" add column if not exists "created_at" timestamptz not null default now(), add column "updated_at" timestamptz not null default now(), add column "deleted_at" timestamptz null;');
        this.addSql('alter table if exists "notification_provider" alter column "channels" type text[] using ("channels"::text[]);');
        this.addSql('alter table if exists "notification_provider" alter column "channels" set default \'{}\';');
        this.addSql('alter table if exists "notification" add column if not exists "updated_at" timestamptz not null default now(), add column "deleted_at" timestamptz null;');
        this.addSql('drop index if exists "IDX_notification_idempotency_key";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_notification_idempotency_key_unique" ON "notification" (idempotency_key) WHERE deleted_at IS NULL;');
    }
}
exports.Migration20240628075401 = Migration20240628075401;
//# sourceMappingURL=Migration20240628075401.js.map