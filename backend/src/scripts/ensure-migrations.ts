import { Pool } from "pg"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Startup script to ensure XML Importer, Econt Shipping, and Brand tables exist
 * Runs automatically at startup via init-backend
 * Checks if tables exist, creates them if missing
 */
export default async function ensureMigrations() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.log("⚠️  DATABASE_URL not available, skipping migration check")
    return
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
  })

  try {
    // Check and create econt_settings table if it doesn't exist
    const econtSettingsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'econt_settings'
      );
    `)

    if (!econtSettingsExists.rows[0]?.exists) {
      console.log("📦 Creating econt_settings table...")
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "econt_settings" (
          "id" text NOT NULL,
          "username" text NOT NULL,
          "password" text NOT NULL,
          "live" boolean NOT NULL DEFAULT false,
          "sender_type" text NOT NULL DEFAULT 'OFFICE',
          "sender_city" text NOT NULL,
          "sender_post_code" text NOT NULL,
          "sender_office_code" text NULL,
          "sender_street" text NULL,
          "sender_street_num" text NULL,
          "sender_quarter" text NULL,
          "sender_building_num" text NULL,
          "sender_entrance_num" text NULL,
          "sender_floor_num" text NULL,
          "sender_apartment_num" text NULL,
          "created_at" timestamptz NOT NULL DEFAULT now(),
          "updated_at" timestamptz NOT NULL DEFAULT now(),
          "deleted_at" timestamptz NULL,
          CONSTRAINT "econt_settings_pkey" PRIMARY KEY ("id")
        );
      `)

      await pool.query(`
        CREATE INDEX IF NOT EXISTS "IDX_econt_settings_deleted_at" 
        ON "econt_settings" ("deleted_at") 
        WHERE "deleted_at" IS NULL;
      `)

      console.log("✅ econt_settings table created")
    } else {
      console.log("✅ econt_settings table already exists")
    }

    // Check and create brand table if it doesn't exist
    const brandExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'brand'
      );
    `)

    if (!brandExists.rows[0]?.exists) {
      console.log("📦 Creating brand table...")
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "brand" (
          "id" text NOT NULL,
          "name" text NOT NULL,
          "image_url" text NULL,
          "created_at" timestamptz NOT NULL DEFAULT now(),
          "updated_at" timestamptz NOT NULL DEFAULT now(),
          "deleted_at" timestamptz NULL,
          CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
        );
      `)

      await pool.query(`
        CREATE INDEX IF NOT EXISTS "IDX_brand_name" 
        ON "brand" (name) 
        WHERE deleted_at IS NULL;
      `)

      await pool.query(`
        CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" 
        ON "brand" (deleted_at) 
        WHERE deleted_at IS NULL;
      `)

      console.log("✅ brand table created")
    } else {
      console.log("✅ brand table already exists")
    }

    // Check if product-brand link table exists
    const linkTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'link_product_brand'
      );
    `)

    if (!linkTableExists.rows[0]?.exists) {
      console.log("⚠️  link_product_brand table not found")
      console.log("   This table should be created by 'medusa db:sync-links'")
      console.log("   Run 'npx medusa db:sync-links' manually if needed")
      console.log("   Or ensure 'init-backend' runs successfully at startup")
    } else {
      console.log("✅ link_product_brand table exists")
    }

    const requiredColumns = ['created_at', 'updated_at', 'deleted_at']
    const tables = ['xml_import_mapping', 'xml_import_config', 'xml_import_execution', 'xml_import_execution_log']
    
    // Check which tables exist
    const existingTables: string[] = []
    for (const table of tables) {
      const checkResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table])
      
      if (checkResult.rows[0]?.exists) {
        existingTables.push(table)
      }
    }
    
    if (existingTables.length > 0) {
      // Some tables exist - check for missing columns and add them
      let needsUpdate = false
      const missingColumns: Array<{ table: string; column: string }> = []
      
      // Check each existing table for missing columns
      for (const table of existingTables) {
        for (const column of requiredColumns) {
          const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            AND column_name = $2;
          `, [table, column])
          
          if (checkColumn.rows.length === 0) {
            needsUpdate = true
            missingColumns.push({ table, column })
          }
        }
      }
      
      if (needsUpdate) {
        console.log(`📦 Adding missing timestamp columns to existing tables...`)
        console.log(`   Missing: ${missingColumns.map(m => `${m.table}.${m.column}`).join(', ')}`)
        
        // Add missing columns to each table
        for (const { table, column } of missingColumns) {
          try {
            if (column === 'deleted_at') {
              await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} TIMESTAMP NULL;`)
            } else {
              // created_at and updated_at should have defaults
              await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} TIMESTAMP DEFAULT NOW();`)
            }
            
            // Verify the column was actually added
            const verifyColumn = await pool.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = $1
              AND column_name = $2;
            `, [table, column])
            
            if (verifyColumn.rows.length > 0) {
              console.log(`   ✅ Added ${column} to ${table}`)
            } else {
              console.error(`   ❌ Failed to add ${column} to ${table} - column still missing after ALTER TABLE`)
            }
          } catch (error: any) {
            // Check if column exists now (might have been added by another process)
            const verifyColumn = await pool.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = $1
              AND column_name = $2;
            `, [table, column])
            
            if (verifyColumn.rows.length > 0) {
              console.log(`   ✅ ${column} already exists in ${table}`)
            } else if (!error.message?.includes("already exists") && error.code !== "42P07") {
              console.error(`   ❌ Error adding ${column} to ${table}: ${error.message}`)
              throw error // Re-throw if it's a real error and column doesn't exist
            }
          }
        }
        console.log("✅ Finished checking/adding timestamp columns")
      } else {
        console.log("✅ XML Importer tables already exist with all required columns")
      }
      
      // If all tables exist, we're done
      if (existingTables.length === tables.length) {
        return
      }
      
      // Otherwise, continue to create missing tables
      console.log(`📦 Some tables are missing (${tables.length - existingTables.length} of ${tables.length}), creating them...`)
    }

    console.log("📦 XML Importer tables not found, running migrations...")

    // Read and execute migration SQL
    // Try multiple possible paths (development and production builds)
    const possiblePaths = [
      join(__dirname, "../modules/xml-product-importer/migrations/create-tables.sql"),
      join(process.cwd(), "src/modules/xml-product-importer/migrations/create-tables.sql"),
      join(process.cwd(), ".medusa/server/src/modules/xml-product-importer/migrations/create-tables.sql"),
    ]

    let sqlPath: string | null = null
    for (const path of possiblePaths) {
      if (require("fs").existsSync(path)) {
        sqlPath = path
        break
      }
    }

    if (!sqlPath) {
      console.warn("⚠️  Migration SQL file not found. Tried:", possiblePaths.join(", "))
      return
    }

    const sql = readFileSync(sqlPath, "utf-8")
    
    // Split SQL into statements, preserving CREATE TABLE and CREATE INDEX separately
    // This ensures tables are created before indexes
    const lines = sql.split("\n")
    const statements: string[] = []
    let currentStatement = ""

    for (const line of lines) {
      const trimmed = line.trim()
      // Skip comments and empty lines
      if (trimmed.startsWith("--") || trimmed.length === 0) {
        continue
      }
      
      currentStatement += line + "\n"
      
      // If line ends with semicolon, we have a complete statement
      if (trimmed.endsWith(";")) {
        const statement = currentStatement.trim()
        if (statement.length > 0) {
          statements.push(statement)
        }
        currentStatement = ""
      }
    }

    // Execute statements one by one, ensuring each completes before the next
    let successCount = 0
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement)
          successCount++
        } catch (error: any) {
          // Ignore "already exists" errors (idempotent)
          if (
            error.message?.includes("already exists") ||
            error.code === "42P07" ||
            error.message?.includes("duplicate key") ||
            error.message?.includes("already exist")
          ) {
            // Table/index already exists, continue
            successCount++
            continue
          }
          // For "does not exist" errors, check if it's an index creation issue
          // Indexes might fail if table doesn't exist yet (shouldn't happen, but handle gracefully)
          if (error.message?.includes("does not exist")) {
            if (statement.includes("CREATE INDEX")) {
              console.warn(`  Index creation skipped (table may not be ready): ${error.message}`)
              // Try to create the index later - for now, skip it
              continue
            } else {
              // Table creation failed - this is more serious
              console.error(`  ❌ Failed to create table: ${error.message}`)
              console.error(`  Statement: ${statement.substring(0, 150)}...`)
              // Continue anyway - might be a transient issue
              continue
            }
          }
          // Log other errors but continue
          console.warn(`  Warning: ${error.message}`)
          console.warn(`  Statement: ${statement.substring(0, 80)}...`)
        }
      }
    }

    if (successCount > 0) {
      console.log(`✅ XML Importer migrations completed (${successCount}/${statements.length} statements)`)
      
      // Verify all tables have required columns after creation
      console.log("🔍 Verifying all tables have required columns...")
      const requiredColumns = ['created_at', 'updated_at', 'deleted_at']
      const tables = ['xml_import_mapping', 'xml_import_config', 'xml_import_execution', 'xml_import_execution_log']
      
      let allColumnsPresent = true
      for (const table of tables) {
        for (const column of requiredColumns) {
          const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            AND column_name = $2;
          `, [table, column])
          
          if (checkColumn.rows.length === 0) {
            console.error(`   ❌ Missing column: ${table}.${column}`)
            allColumnsPresent = false
            
            // Try to add it
            try {
              if (column === 'deleted_at') {
                await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} TIMESTAMP NULL;`)
              } else {
                await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} TIMESTAMP DEFAULT NOW();`)
              }
              console.log(`   ✅ Added missing ${column} to ${table}`)
            } catch (addError: any) {
              console.error(`   ❌ Failed to add ${column} to ${table}: ${addError.message}`)
            }
          }
        }
      }
      
      if (allColumnsPresent) {
        console.log("✅ All tables verified with required columns")
      } else {
        console.warn("⚠️  Some columns were missing and have been added")
      }
    } else {
      console.warn("⚠️  No migrations were executed")
    }
  } catch (error: any) {
    console.error("❌ Error running XML Importer migrations:", error.message)
    // Don't throw - allow server to start even if migrations fail
    // They can be run manually if needed
  } finally {
    await pool.end()
  }
  
  // Note: MedusaJS link tables are created by 'medusa db:sync-links' or 'medusa db:migrate'
  // These should be run by 'init-backend', but if links are missing, run:
  // npx medusa db:sync-links
  // The link table for product-brand should be named: link_product_brand
  console.log("ℹ️  MedusaJS link tables should be created by 'init-backend'")
  console.log("   If you see link errors, ensure 'medusa db:sync-links' has been run")
}


