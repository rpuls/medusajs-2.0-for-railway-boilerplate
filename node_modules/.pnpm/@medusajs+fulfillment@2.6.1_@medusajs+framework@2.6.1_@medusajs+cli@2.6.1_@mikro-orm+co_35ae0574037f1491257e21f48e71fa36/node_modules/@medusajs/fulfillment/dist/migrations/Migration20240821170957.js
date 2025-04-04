"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240821170957 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240821170957 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "shipping_option" drop constraint if exists "shipping_option_price_type_check";');
        this.addSql('alter table if exists "shipping_option" drop constraint if exists "shipping_option_fulfillment_provider_id_foreign";');
        this.addSql('alter table if exists "shipping_option" alter column "price_type" type text using ("price_type"::text);');
        this.addSql('alter table if exists "shipping_option" add constraint "shipping_option_price_type_check" check ("price_type" in (\'calculated\', \'flat\'));');
        this.addSql('alter table if exists "shipping_option" alter column "price_type" set default \'flat\';');
        this.addSql('alter table if exists "fulfillment" add column if not exists "marked_shipped_by" text null, add column if not exists "created_by" text null;');
    }
    async down() {
        this.addSql('alter table if exists "shipping_option" drop constraint if exists "shipping_option_price_type_check";');
        this.addSql('alter table if exists "shipping_option" alter column "price_type" type text using ("price_type"::text);');
        this.addSql('alter table if exists "shipping_option" add constraint "shipping_option_price_type_check" check ("price_type" in (\'calculated\', \'flat\'));');
        this.addSql('alter table if exists "shipping_option" alter column "price_type" set default \'calculated\';');
        this.addSql('alter table if exists "fulfillment" drop column if exists "marked_shipped_by";');
        this.addSql('alter table if exists "fulfillment" drop column if exists "created_by";');
    }
}
exports.Migration20240821170957 = Migration20240821170957;
//# sourceMappingURL=Migration20240821170957.js.map