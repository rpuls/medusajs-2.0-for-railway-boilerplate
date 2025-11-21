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
      console.log("✅ XML Importer tables already exist")
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
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement)
        } catch (error: any) {
          // Ignore "already exists" errors (idempotent)
          if (
            error.message?.includes("already exists") ||
            error.code === "42P07" ||
            error.message?.includes("duplicate key")
          ) {
            // Table/index already exists, continue
            continue
          }
          throw error
        }
      }
    }

    console.log("✅ XML Importer migrations completed successfully")
  } catch (error: any) {
    console.error("❌ Error running XML Importer migrations:", error.message)
    // Don't throw - allow server to start even if migrations fail
    // They can be run manually if needed
  } finally {
    await pool.end()
  }
}

