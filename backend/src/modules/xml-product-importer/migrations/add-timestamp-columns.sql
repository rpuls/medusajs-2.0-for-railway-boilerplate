-- Add created_at, updated_at, and deleted_at columns to all XML importer tables
-- These columns are automatically expected by MedusaJS but may be missing from existing tables

-- Add columns to xml_import_mapping
ALTER TABLE xml_import_mapping 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add columns to xml_import_config
ALTER TABLE xml_import_config 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add columns to xml_import_execution
ALTER TABLE xml_import_execution 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add columns to xml_import_execution_log
ALTER TABLE xml_import_execution_log 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

