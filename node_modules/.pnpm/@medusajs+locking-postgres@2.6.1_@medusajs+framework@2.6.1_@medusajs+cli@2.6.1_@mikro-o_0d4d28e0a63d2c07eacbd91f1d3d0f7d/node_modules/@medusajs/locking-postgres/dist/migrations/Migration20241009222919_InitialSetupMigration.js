"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241009222919_InitialSetupMigration = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241009222919_InitialSetupMigration extends migrations_1.Migration {
    async up() {
        this.addSql('create table if not exists "locking" ("id" text not null, "owner_id" text null, "expiration" timestamptz null, constraint "locking_pkey" primary key ("id"));');
    }
    async down() {
        this.addSql(`drop table "locking";`);
    }
}
exports.Migration20241009222919_InitialSetupMigration = Migration20241009222919_InitialSetupMigration;
//# sourceMappingURL=Migration20241009222919_InitialSetupMigration.js.map