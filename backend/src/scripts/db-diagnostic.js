const { Pool } = require('pg')
require('dotenv').config()
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)

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

    client.release()

    // Test medusa migration
    console.log('\n🔄 Testing Medusa Migration:')
    try {
      console.log('Running npx medusa db:migrate...')
      const { stdout, stderr } = await execPromise('npx medusa db:migrate', {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'development',
          DEBUG: 'medusa*' // Enable Medusa debug logging
        }
      })
      
      if (stdout) console.log('Migration Output:', stdout)
      if (stderr) console.error('Migration Errors:', stderr)
    } catch (migrationError) {
      console.error('\n❌ Migration Failed:')
      if (migrationError.stdout) console.log('Migration Output:', migrationError.stdout)
      if (migrationError.stderr) console.error('Migration Error Output:', migrationError.stderr)
      console.error('Exit Code:', migrationError.code)
      process.exit(1)
    }

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
    process.exit(1)
  } finally {
    // Close pool
    await pool.end()
  }
}

runDiagnostics().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
