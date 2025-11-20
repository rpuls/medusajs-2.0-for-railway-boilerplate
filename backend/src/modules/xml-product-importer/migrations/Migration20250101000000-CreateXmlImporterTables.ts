import { Migration } from '@mikro-orm/migrations'


export class Migration20250101000000CreateXmlImporterTables extends Migration {
  async up(): Promise<void> {
    // Create xml_import_mapping table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS xml_import_mapping (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        xml_url VARCHAR(500),
        mappings JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

    // Create xml_import_config table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS xml_import_config (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        xml_url VARCHAR(500) NOT NULL,
        mapping_id VARCHAR(255) NOT NULL REFERENCES xml_import_mapping(id) ON DELETE CASCADE,
        options JSONB NOT NULL,
        recurring JSONB,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

    // Create xml_import_execution table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS xml_import_execution (
        id VARCHAR(255) PRIMARY KEY,
        config_id VARCHAR(255) NOT NULL REFERENCES xml_import_config(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        total_products INTEGER,
        processed_products INTEGER DEFAULT 0,
        successful_products INTEGER DEFAULT 0,
        failed_products INTEGER DEFAULT 0,
        error TEXT
      );
    `)

    // Create xml_import_execution_log table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS xml_import_execution_log (
        id VARCHAR(255) PRIMARY KEY,
        execution_id VARCHAR(255) NOT NULL REFERENCES xml_import_execution(id) ON DELETE CASCADE,
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        product_index INTEGER,
        product_data JSONB,
        error JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `)

    // Create indexes for better performance
    this.addSql(`
      CREATE INDEX IF NOT EXISTS idx_xml_import_config_mapping_id ON xml_import_config(mapping_id);
      CREATE INDEX IF NOT EXISTS idx_xml_import_execution_config_id ON xml_import_execution(config_id);
      CREATE INDEX IF NOT EXISTS idx_xml_import_execution_status ON xml_import_execution(status);
      CREATE INDEX IF NOT EXISTS idx_xml_import_execution_log_execution_id ON xml_import_execution_log(execution_id);
    `)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS xml_import_execution_log;`)
    this.addSql(`DROP TABLE IF EXISTS xml_import_execution;`)
    this.addSql(`DROP TABLE IF EXISTS xml_import_config;`)
    this.addSql(`DROP TABLE IF EXISTS xml_import_mapping;`)
  }
}

