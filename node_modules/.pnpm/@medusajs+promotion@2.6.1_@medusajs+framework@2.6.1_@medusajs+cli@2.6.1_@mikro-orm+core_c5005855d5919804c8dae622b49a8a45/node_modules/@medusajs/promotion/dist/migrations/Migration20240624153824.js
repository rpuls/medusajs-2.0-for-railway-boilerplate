"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240624153824 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240624153824 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "promotion_campaign" drop constraint if exists "IDX_campaign_identifier_unique";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_promotion_campaign_campaign_identifier_unique" ON "promotion_campaign" (campaign_identifier) WHERE deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_promotion_campaign_campaign_identifier_unique";');
        this.addSql('alter table if exists "promotion_campaign" add constraint "IDX_campaign_identifier_unique" unique ("campaign_identifier");');
    }
}
exports.Migration20240624153824 = Migration20240624153824;
//# sourceMappingURL=Migration20240624153824.js.map