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

// Copy patches/ so pnpm patchedDependencies paths resolve during `pnpm i` in .medusa/server (Railway/Docker).
const patchesSrc = path.join(process.cwd(), 'patches');
const patchesDest = path.join(MEDUSA_SERVER_PATH, 'patches');
if (fs.existsSync(patchesSrc)) {
  fs.cpSync(patchesSrc, patchesDest, { recursive: true });
}

// Copy src/assets/ (fonts, images) so they are available in the compiled server
const assetsSrc = path.join(process.cwd(), 'src', 'assets');
const assetsDest = path.join(MEDUSA_SERVER_PATH, 'src', 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log('Copied src/assets/ to .medusa/server/src/assets/');
}

// Install dependencies
console.log('Installing dependencies in .medusa/server...');
execSync('pnpm i --prod --frozen-lockfile', {
  cwd: MEDUSA_SERVER_PATH,
  stdio: 'inherit'
});
