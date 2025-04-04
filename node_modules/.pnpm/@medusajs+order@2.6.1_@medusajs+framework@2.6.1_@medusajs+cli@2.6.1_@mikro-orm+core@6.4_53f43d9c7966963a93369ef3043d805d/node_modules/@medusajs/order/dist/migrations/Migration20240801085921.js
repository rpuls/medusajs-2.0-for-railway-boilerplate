"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20240801085921 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20240801085921 extends migrations_1.Migration {
    async up() {
        this.addSql(`
        ALTER TABLE "return"
          ADD COLUMN IF NOT exists "requested_at" timestamptz NULL;

        
        ALTER TABLE "return" ALTER COLUMN "status" DROP DEFAULT;
        ALTER TABLE "return" ALTER COLUMN "status" TYPE text USING "status"::text;
        DROP TYPE return_status_enum;

        CREATE TYPE return_status_enum AS ENUM (
          'open',
          'requested',
          'received',
          'partially_received',
          'canceled'
        );
        
        ALTER TABLE "return" ALTER COLUMN "status" TYPE return_status_enum USING "status"::text::return_status_enum;
        ALTER TABLE "return" ALTER COLUMN "status" SET DEFAULT 'open';        
      `);
    }
}
exports.Migration20240801085921 = Migration20240801085921;
//# sourceMappingURL=Migration20240801085921.js.map