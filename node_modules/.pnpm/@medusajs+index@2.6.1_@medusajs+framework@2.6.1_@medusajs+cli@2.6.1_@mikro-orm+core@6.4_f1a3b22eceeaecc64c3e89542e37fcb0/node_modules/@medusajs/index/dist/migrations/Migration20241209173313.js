"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241209173313 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241209173313 extends migrations_1.Migration {
    async up() {
        this.addSql(`
      ALTER TABLE "index_data"
      ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz NULL;
    `);
        this.addSql(`
      ALTER TABLE "index_relation"
      ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz NULL;
    `);
    }
    async down() {
        this.addSql(`
      ALTER TABLE "index_data"
      DROP COLUMN IF EXISTS "created_at",
      DROP COLUMN IF EXISTS "updated_at",
      DROP COLUMN IF EXISTS "deleted_at";
    `);
        this.addSql(`
      ALTER TABLE "index_relation"
      DROP COLUMN IF EXISTS "created_at",
      DROP COLUMN IF EXISTS "updated_at",
      DROP COLUMN IF EXISTS "deleted_at";
    `);
    }
}
exports.Migration20241209173313 = Migration20241209173313;
//# sourceMappingURL=Migration20241209173313.js.map