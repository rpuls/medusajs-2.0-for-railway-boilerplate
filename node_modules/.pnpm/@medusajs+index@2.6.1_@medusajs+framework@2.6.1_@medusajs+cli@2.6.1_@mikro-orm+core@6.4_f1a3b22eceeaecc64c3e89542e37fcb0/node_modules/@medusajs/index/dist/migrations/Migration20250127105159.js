"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250127105159 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250127105159 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "index_relation" alter column "id" set not null;`);
        this.addSql(`alter table if exists "index_relation" add constraint "IDX_index_relation_id_pivot_parent_name_child_name_parent_id_child_id_unique" unique ("parent_id", "child_id", "child_name", "parent_name", "pivot");`);
    }
    async down() {
        this.addSql(`alter table if exists "index_relation" drop constraint "IDX_index_relation_id_pivot_parent_name_child_name_parent_id_child_id_unique";`);
        this.addSql(`alter table if exists "index_relation" alter column "id" drop not null;`);
    }
}
exports.Migration20250127105159 = Migration20250127105159;
//# sourceMappingURL=Migration20250127105159.js.map