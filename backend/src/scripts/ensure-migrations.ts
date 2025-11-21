import { Pool } from "pg"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Startup script to ensure XML Importer tables exist
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
    // Check if xml_import_mapping table exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'xml_import_mapping'
      );
    `)

    const tableExists = checkResult.rows[0]?.exists

    if (tableExists) {
      // Check if deleted_at column exists (it might be missing from older migrations)
      const checkDeletedAt = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'xml_import_mapping' 
        AND column_name = 'deleted_at';
      `)
      
      if (checkDeletedAt.rows.length === 0) {
        console.log("📦 Adding missing deleted_at columns to existing tables...")
        // Add deleted_at to all tables that might be missing it
        const tables = ['xml_import_mapping', 'xml_import_config', 'xml_import_execution', 'xml_import_execution_log']
        for (const table of tables) {
          try {
            await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;`)
          } catch (error: any) {
            if (!error.message?.includes("already exists") && error.code !== "42P07") {
              console.warn(`  Warning adding deleted_at to ${table}: ${error.message}`)
            }
          }
        }
        console.log("✅ Added missing deleted_at columns")
      } else {
        console.log("✅ XML Importer tables already exist with all required columns")
      }
      return
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
}


