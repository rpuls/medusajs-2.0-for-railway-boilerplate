"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241217162224 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241217162224 extends migrations_1.Migration {
    async up() {
        this.addSql('create table if not exists "order_credit_line" ("id" text not null, "order_id" text not null, "reference" text null, "reference_id" text null, "amount" numeric not null, "raw_amount" jsonb not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_credit_line_pkey" primary key ("id"));');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_credit_line_order_id" ON "order_credit_line" (order_id) WHERE deleted_at IS NOT NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_credit_line_deleted_at" ON "order_credit_line" (deleted_at) WHERE deleted_at IS NOT NULL;');
        this.addSql('alter table if exists "order_credit_line" add constraint "order_credit_line_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade;');
    }
    async down() {
        this.addSql('drop table if exists "order_credit_line" cascade;');
    }
}
exports.Migration20241217162224 = Migration20241217162224;
//# sourceMappingURL=Migration20241217162224.js.map