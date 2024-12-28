import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

const { Pool } = pg

async function runDiagnostics() {
  console.log('🔍 Starting Database Diagnostics')
  console.log('\n📊 Environment Information:')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Present' : '❌ Missing')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add longer timeout for initial connection
    connectionTimeoutMillis: 10000
  })

  try {
    console.log('\n🔌 Attempting database connection...')
    
    // Test basic connection
    const client = await pool.connect()
    console.log('✓ Successfully connected to database')

    // Get database information
    console.log('\n📋 Database Information:')
    const versionResult = await client.query('SELECT version()')
    console.log('Database Version:', versionResult.rows[0].version)
    
    const dbNameResult = await client.query('SELECT current_database()')
    console.log('Current Database:', dbNameResult.rows[0].current_database)
    
    // Check database size
    const dbSizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `)
    console.log('Database Size:', dbSizeResult.rows[0].size)

    // List all tables and their row counts
    console.log('\n📊 Table Information:')
    const tablesResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
    `)
    
    if (tablesResult.rows.length === 0) {
      console.log('❗ No tables found in database')
    } else {
      tablesResult.rows.forEach(table => {
        console.log(`${table.schemaname}.${table.tablename}:`)
        console.log(`  - Size: ${table.size}`)
        console.log(`  - Rows: ${table.row_count}`)
      })
    }

    // Check database permissions
    console.log('\n🔒 Permission Check:')
    const currentUserResult = await client.query('SELECT current_user')
    console.log('Current User:', currentUserResult.rows[0].current_user)
    
    const userPermsResult = await client.query(`
      SELECT 
        table_schema,
        table_name, 
        privilege_type
      FROM information_schema.table_privileges 
      WHERE grantee = current_user
    `)
    
    console.log('User Permissions:')
    userPermsResult.rows.forEach(perm => {
      console.log(`  - ${perm.table_schema}.${perm.table_name}: ${perm.privilege_type}`)
    })

    // Check connection pool status
    console.log('\n🏊 Connection Pool Status:')
    console.log('Total:', pool.totalCount)
    console.log('Idle:', pool.idleCount)
    console.log('Waiting:', pool.waitingCount)

    client.release()
  } catch (error) {
    console.error('\n❌ Database Error:')
    console.error('Error Type:', error.name)
    console.error('Error Message:', error.message)
    if (error.code) console.error('Error Code:', error.code)
    if (error.detail) console.error('Error Detail:', error.detail)
    if (error.hint) console.error('Error Hint:', error.hint)
    if (error.position) console.error('Error Position:', error.position)
    
    // Additional connection details if available
    if (error.client) {
      console.error('\nConnection Details:')
      console.error('Host:', error.client.host)
      console.error('Port:', error.client.port)
      console.error('Database:', error.client.database)
      console.error('User:', error.client.user)
    }
  } finally {
    // Close pool
    await pool.end()
  }
}

runDiagnostics().catch(console.error)
