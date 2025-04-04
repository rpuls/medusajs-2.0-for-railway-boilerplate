"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250120115059 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250120115059 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "cart" drop constraint if exists "cart_shipping_address_id_unique";');
        this.addSql('alter table if exists "cart" drop constraint if exists "cart_billing_address_id_unique";');
    }
    async down() {
        this.addSql('alter table if exists "cart" add constraint "cart_shipping_address_id_unique" unique ("shipping_address_id");');
        this.addSql('alter table if exists "cart" add constraint "cart_billing_address_id_unique" unique ("billing_address_id");');
    }
}
exports.Migration20250120115059 = Migration20250120115059;
//# sourceMappingURL=Migration20250120115059.js.map