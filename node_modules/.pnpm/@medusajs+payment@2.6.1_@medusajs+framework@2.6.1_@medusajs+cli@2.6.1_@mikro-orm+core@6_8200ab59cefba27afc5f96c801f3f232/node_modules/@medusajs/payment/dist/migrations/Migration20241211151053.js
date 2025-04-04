"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241211151053 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241211151053 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "payment_session" drop constraint if exists "payment_session_payment_collection_id_foreign";');
        this.addSql('alter table if exists "payment" drop constraint if exists "payment_payment_collection_id_foreign";');
        this.addSql('alter table if exists "payment_provider" add column if not exists "created_at" timestamptz not null default now(), add column if not exists "updated_at" timestamptz not null default now(), add column if not exists "deleted_at" timestamptz null;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_payment_provider_deleted_at" ON "payment_provider" (deleted_at) WHERE deleted_at IS NULL;');
        this.addSql('alter table if exists "payment_session" alter column "data" type jsonb using ("data"::jsonb);');
        this.addSql('alter table if exists "payment_session" alter column "data" set default \'{}\';');
        this.addSql('alter table if exists "payment_session" add constraint "payment_session_payment_collection_id_foreign" foreign key ("payment_collection_id") references "payment_collection" ("id") on update cascade on delete cascade;');
        this.addSql('alter table if exists "payment" add constraint "payment_payment_collection_id_foreign" foreign key ("payment_collection_id") references "payment_collection" ("id") on update cascade on delete cascade;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_refund_reason_deleted_at" ON "refund_reason" (deleted_at) WHERE deleted_at IS NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_refund_refund_reason_id" ON "refund" (refund_reason_id) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('alter table if exists "payment_session" drop constraint if exists "payment_session_payment_collection_id_foreign";');
        this.addSql('alter table if exists "payment" drop constraint if exists "payment_payment_collection_id_foreign";');
        this.addSql('drop index if exists "IDX_payment_provider_deleted_at";');
        this.addSql('alter table if exists "payment_provider" drop column if exists "created_at";');
        this.addSql('alter table if exists "payment_provider" drop column if exists "updated_at";');
        this.addSql('alter table if exists "payment_provider" drop column if exists "deleted_at";');
        this.addSql('alter table if exists "payment_session" alter column "data" drop default;');
        this.addSql('alter table if exists "payment_session" alter column "data" type jsonb using ("data"::jsonb);');
        this.addSql('alter table if exists "payment_session" add constraint "payment_session_payment_collection_id_foreign" foreign key ("payment_collection_id") references "payment_collection" ("id") on update cascade;');
        this.addSql('alter table if exists "payment" add constraint "payment_payment_collection_id_foreign" foreign key ("payment_collection_id") references "payment_collection" ("id") on update cascade;');
        this.addSql('drop index if exists "IDX_refund_reason_deleted_at";');
        this.addSql('drop index if exists "IDX_refund_refund_reason_id";');
    }
}
exports.Migration20241211151053 = Migration20241211151053;
//# sourceMappingURL=Migration20241211151053.js.map