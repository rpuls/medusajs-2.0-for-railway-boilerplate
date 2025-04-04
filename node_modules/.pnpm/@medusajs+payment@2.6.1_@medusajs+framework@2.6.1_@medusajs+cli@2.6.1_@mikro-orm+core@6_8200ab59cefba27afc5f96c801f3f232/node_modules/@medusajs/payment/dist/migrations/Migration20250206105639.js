"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250206105639 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250206105639 extends migrations_1.Migration {
    async up() {
        this.addSql(`drop table if exists "payment_method_token" cascade;`);
    }
    async down() {
        this.addSql(`create table if not exists "payment_method_token" ("id" text not null, "provider_id" text not null, "data" jsonb null, "name" text not null, "type_detail" text null, "description_detail" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_method_token_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_method_token_deleted_at" ON "payment_method_token" (deleted_at) WHERE deleted_at IS NULL;`);
    }
}
exports.Migration20250206105639 = Migration20250206105639;
//# sourceMappingURL=Migration20250206105639.js.map