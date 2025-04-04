"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250207132723 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250207132723 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "payment_collection" drop constraint if exists "payment_collection_status_check";`);
        this.addSql(`alter table if exists "payment_collection" add constraint "payment_collection_status_check" check("status" in ('not_paid', 'awaiting', 'authorized', 'partially_authorized', 'canceled', 'failed', 'completed'));`);
    }
    async down() {
        this.addSql(`alter table if exists "payment_collection" drop constraint if exists "payment_collection_status_check";`);
        this.addSql(`alter table if exists "payment_collection" add constraint "payment_collection_status_check" check("status" in ('not_paid', 'awaiting', 'authorized', 'partially_authorized', 'canceled'));`);
    }
}
exports.Migration20250207132723 = Migration20250207132723;
//# sourceMappingURL=Migration20250207132723.js.map