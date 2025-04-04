"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250128132404 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250128132404 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "index_sync" ("id" text not null, "entity" text not null, "last_key" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "index_sync_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_index_sync_deleted_at" ON "index_sync" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_index_sync_entity" ON "index_sync" (entity) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "index_sync" cascade;`);
    }
}
exports.Migration20250128132404 = Migration20250128132404;
//# sourceMappingURL=Migration20250128132404.js.map