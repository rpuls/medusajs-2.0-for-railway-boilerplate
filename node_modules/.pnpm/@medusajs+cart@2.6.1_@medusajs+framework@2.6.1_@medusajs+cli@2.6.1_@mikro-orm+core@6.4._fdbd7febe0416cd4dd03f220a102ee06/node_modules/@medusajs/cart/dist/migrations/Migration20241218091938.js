"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241218091938 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241218091938 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table if exists "cart_line_item" add column if not exists "is_custom_price" boolean not null default false;');
    }
    async down() {
        this.addSql('alter table if exists "cart_line_item" drop column if exists "is_custom_price";');
    }
}
exports.Migration20241218091938 = Migration20241218091938;
//# sourceMappingURL=Migration20241218091938.js.map