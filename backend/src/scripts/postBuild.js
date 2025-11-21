const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEDUSA_SERVER_PATH = path.join(process.cwd(), '.medusa', 'server');

// Check if .medusa/server exists - if not, build process failed
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error('.medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.');
}

// Copy pnpm-lock.yaml
fs.copyFileSync(
  path.join(process.cwd(), 'pnpm-lock.yaml'),
  path.join(MEDUSA_SERVER_PATH, 'pnpm-lock.yaml')
);

// Copy .env if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(
    envPath,
    path.join(MEDUSA_SERVER_PATH, '.env')
  );
}

// Install dependencies
console.log('Installing dependencies in .medusa/server...');
execSync('pnpm i --prod --frozen-lockfile', { 
  cwd: MEDUSA_SERVER_PATH,
  stdio: 'inherit'
});

// Run XML Importer migrations if DATABASE_URL is available
// Note: This is a best-effort attempt during build. If it fails or DATABASE_URL isn't available,
// migrations will be handled by init-backend at startup (which is the preferred method).
if (process.env.DATABASE_URL) {
  console.log('Running XML Importer migrations (best-effort during build)...');
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000, // 5 second timeout
  });

  const sqlPath = path.join(
    process.cwd(),
    'src/modules/xml-product-importer/migrations/create-tables.sql'
  );

  if (fs.existsSync(sqlPath)) {
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute statements sequentially
    let migrationPromise = Promise.resolve();
    for (const statement of statements) {
      if (statement.trim()) {
        migrationPromise = migrationPromise.then(() => {
          return pool.query(statement).catch(error => {
            // Ignore "already exists" errors
            if (
              !error.message?.includes('already exists') &&
              error.code !== '42P07' &&
              !error.message?.includes('duplicate key')
            ) {
              console.warn('  Migration warning:', error.message);
            }
          });
        });
      }
    }

    migrationPromise
      .then(() => pool.end())
      .then(() => console.log('✅ XML Importer migrations completed'))
      .catch(error => {
        console.warn('⚠️  Migration error (will retry at startup):', error.message);
        pool.end().catch(() => {});
      });
  } else {
    console.log('⚠️  XML Importer migration SQL file not found');
  }
} else {
  console.log('ℹ️  DATABASE_URL not available during build - migrations will run at startup via init-backend');
}
