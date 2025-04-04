"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250115160517 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250115160517 extends migrations_1.Migration {
    async up() {
        this.addSql('drop index if exists "IDX_payment_collection_region_id";');
        this.addSql('alter table if exists "payment_collection" drop column if exists "region_id";');
        this.addSql('alter table if exists "payment" drop column if exists "cart_id";');
        this.addSql('alter table if exists "payment" drop column if exists "order_id";');
        this.addSql('alter table if exists "payment" drop column if exists "customer_id";');
    }
    async down() {
        this.addSql('alter table if exists "payment_collection" add column if not exists "region_id" text not null;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_payment_collection_region_id" ON "payment_collection" (region_id) WHERE deleted_at IS NULL;');
        this.addSql('alter table if exists "payment" add column if not exists "cart_id" text null, add column if not exists "order_id" text null, add column if not exists "customer_id" text null;');
    }
}
exports.Migration20250115160517 = Migration20250115160517;
//# sourceMappingURL=Migration20250115160517.js.map