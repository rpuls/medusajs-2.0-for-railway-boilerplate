import { Migration } from '@mikro-orm/migrations'

export class Migration20250120000000AddTimestampColumns extends Migration {
  async up(): Promise<void> {
    // Add created_at, updated_at, and deleted_at columns to xml_import_mapping
    this.addSql(`
      ALTER TABLE xml_import_mapping 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `)

    // Add created_at, updated_at, and deleted_at columns to xml_import_config
    this.addSql(`
      ALTER TABLE xml_import_config 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `)

    // Add created_at, updated_at, and deleted_at columns to xml_import_execution
    this.addSql(`
      ALTER TABLE xml_import_execution 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `)

    // Add created_at, updated_at, and deleted_at columns to xml_import_execution_log
    this.addSql(`
      ALTER TABLE xml_import_execution_log 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `)
  }

  async down(): Promise<void> {
    // Remove columns in reverse order
    this.addSql(`
      ALTER TABLE xml_import_execution_log 
        DROP COLUMN IF EXISTS deleted_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS created_at;
    `)

    this.addSql(`
      ALTER TABLE xml_import_execution 
        DROP COLUMN IF EXISTS deleted_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS created_at;
    `)

    this.addSql(`
      ALTER TABLE xml_import_config 
        DROP COLUMN IF EXISTS deleted_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS created_at;
    `)

    this.addSql(`
      ALTER TABLE xml_import_mapping 
        DROP COLUMN IF EXISTS deleted_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS created_at;
    `)
  }
}

