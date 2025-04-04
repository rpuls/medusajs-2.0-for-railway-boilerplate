"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240617102917 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240617102917 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "promotion_application_method" alter column "currency_code" type text using ("currency_code"::text);');
        this.addSql('alter table "promotion_application_method" alter column "currency_code" drop not null;');
    }
    async down() {
        this.addSql('alter table "promotion_application_method" alter column "currency_code" type text using ("currency_code"::text);');
        this.addSql('alter table "promotion_application_method" alter column "currency_code" set not null;');
    }
}
exports.Migration20240617102917 = Migration20240617102917;
//# sourceMappingURL=Migration20240617102917.js.map