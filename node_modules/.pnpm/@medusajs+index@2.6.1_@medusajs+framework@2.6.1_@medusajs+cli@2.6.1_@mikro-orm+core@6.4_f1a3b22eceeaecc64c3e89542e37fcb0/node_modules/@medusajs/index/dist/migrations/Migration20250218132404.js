"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250218132404 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250218132404 extends migrations_1.Migration {
    async up() {
        this.addSql(`
      ALTER TABLE index_data
      ADD COLUMN document_tsv tsvector;
      `);
        this.addSql(`
      UPDATE index_data
      SET document_tsv = to_tsvector('simple', (
        SELECT string_agg(value, ' ')
        FROM jsonb_each_text(data)
      ));
      `);
        this.addSql(`
      CREATE INDEX idx_documents_document_tsv
        ON index_data
        USING gin(document_tsv);
      `);
        this.addSql(`
      CREATE OR REPLACE FUNCTION update_document_tsv() RETURNS trigger AS $$
      BEGIN
        NEW.document_tsv := to_tsvector('simple', (
          SELECT string_agg(value, ' ')
          FROM jsonb_each_text(NEW.data)
        ));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_update_document_tsv
      BEFORE INSERT OR UPDATE ON index_data
      FOR EACH ROW
      EXECUTE FUNCTION update_document_tsv();
      `);
    }
    async down() {
        this.addSql(`DROP TRIGGER IF EXISTS trg_update_document_tsv ON index_data;`);
        this.addSql(`DROP FUNCTION IF EXISTS update_document_tsv;`);
        this.addSql(`DROP INDEX IF EXISTS idx_documents_document_tsv;`);
        this.addSql(`ALTER TABLE index_data DROP COLUMN IF EXISTS document_tsv;`);
    }
}
exports.Migration20250218132404 = Migration20250218132404;
//# sourceMappingURL=Migration20250218132404.js.map