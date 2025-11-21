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

// Copy migration SQL file to build directory so it's available at runtime
const migrationSqlPath = path.join(process.cwd(), 'src/modules/xml-product-importer/migrations/create-tables.sql');
const migrationSqlDest = path.join(MEDUSA_SERVER_PATH, 'src/modules/xml-product-importer/migrations/create-tables.sql');

if (fs.existsSync(migrationSqlPath)) {
  const migrationDir = path.dirname(migrationSqlDest);
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  fs.copyFileSync(migrationSqlPath, migrationSqlDest);
  console.log('✅ Copied XML Importer migration SQL to build directory');
} else {
  console.log('⚠️  XML Importer migration SQL file not found (will be checked at startup)');
}

// Note: Migrations run at startup via ensure-migrations.ts script
// Railway's internal database hostnames (postgres.railway.internal) are only
// available at runtime, not during build.
console.log('ℹ️  XML Importer migrations will run automatically at startup');
