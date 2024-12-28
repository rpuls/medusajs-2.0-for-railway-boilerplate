const { Pool } = require('pg')
const { spawn } = require('child_process')
require('dotenv').config()

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
    console.log('Running npx medusa db:migrate...')

    return new Promise((resolve, reject) => {
      // Set a timeout of 2 minutes
      const timeout = setTimeout(() => {
        console.error('Migration timed out after 2 minutes')
        process.exit(1)
      }, 120000)

      const migration = spawn('npx', ['medusa', 'db:migrate'], {
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'development',
          DEBUG: 'medusa*,pg*', // Enable both Medusa and Postgres debug logging
          MEDUSA_VERBOSE: 'true'
        }
      })

      console.log('Migration process started with PID:', migration.pid)

      migration.stdout.on('data', (data) => {
        console.log('Migration output:', data.toString())
      })

      migration.stderr.on('data', (data) => {
        console.error('Migration error:', data.toString())
      })

      migration.on('error', (error) => {
        clearTimeout(timeout)
        console.error('Failed to start migration:', error)
        reject(error)
      })

      migration.on('close', (code) => {
        clearTimeout(timeout)
        console.log('Migration process exited with code:', code)
        if (code !== 0) {
          reject(new Error(`Migration failed with code ${code}`))
        } else {
          resolve()
        }
      })
    })

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
