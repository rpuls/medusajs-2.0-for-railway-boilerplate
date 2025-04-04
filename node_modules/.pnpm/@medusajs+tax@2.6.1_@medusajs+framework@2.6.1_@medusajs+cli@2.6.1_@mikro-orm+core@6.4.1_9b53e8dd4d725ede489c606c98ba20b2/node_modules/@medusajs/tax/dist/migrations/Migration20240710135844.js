"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240710135844 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240710135844 extends migrations_1.Migration {
    async up() {
        this.addSql('drop index if exists "IDX_tax_region_unique_country_province";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_region_unique_country_province" ON "tax_region" (country_code, province_code) WHERE deleted_at IS NULL;');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_region_unique_country_nullable_province" ON "tax_region" (country_code) WHERE province_code IS NULL AND deleted_at IS NULL;');
    }
    async down() {
        this.addSql('drop index if exists "IDX_tax_region_unique_country_province";');
        this.addSql('drop index if exists "IDX_tax_region_unique_country_nullable_province";');
        this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_region_unique_country_province" ON "tax_region" (country_code, province_code);');
    }
}
exports.Migration20240710135844 = Migration20240710135844;
//# sourceMappingURL=Migration20240710135844.js.map