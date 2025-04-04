"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240821164505 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240821164505 extends migrations_1.Migration {
    async up() {
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_item_deleted_at" ON "order_item" (deleted_at) WHERE deleted_at IS NOT NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_summary_deleted_at" ON "order_summary" (deleted_at) WHERE deleted_at IS NOT NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_claim_item_deleted_at" ON "order_claim_item" (deleted_at) WHERE deleted_at IS NOT NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_return_item_deleted_at" ON "return_item" (deleted_at) WHERE deleted_at IS NOT NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_shipping_deleted_at" ON "order_shipping" (deleted_at) WHERE deleted_at IS NOT NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_transaction_exchange_id" ON "order_transaction" (exchange_id) WHERE exchange_id IS NOT NULL AND deleted_at IS NOT NULL;');
        this.addSql('CREATE INDEX IF NOT EXISTS "IDX_order_transaction_claim_id" ON "order_transaction" (claim_id) WHERE claim_id IS NOT NULL AND deleted_at IS NOT NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_order_item_deleted_at";');
        this.addSql('drop index if exists "IDX_order_summary_deleted_at";');
        this.addSql('drop index if exists "IDX_order_claim_item_deleted_at";');
        this.addSql('drop index if exists "IDX_return_item_deleted_at";');
        this.addSql('drop index if exists "IDX_order_shipping_deleted_at";');
        this.addSql('drop index if exists "IDX_order_transaction_exchange_id";');
        this.addSql('drop index if exists "IDX_order_transaction_claim_id";');
    }
}
exports.Migration20240821164505 = Migration20240821164505;
//# sourceMappingURL=Migration20240821164505.js.map