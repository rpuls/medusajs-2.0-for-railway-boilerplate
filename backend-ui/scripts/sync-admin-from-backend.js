#!/usr/bin/env node

/**
 * Sync script to copy admin routes and menu items from backend to backend-ui.
 * Run this script when you update admin files in backend to keep backend-ui in sync.
 * 
 * Usage: node scripts/sync-admin-from-backend.js
 * 
 * This is only needed for local development. Railway builds will use the committed files.
 */

const fs = require('fs')
const path = require('path')

const backendUiDir = path.resolve(__dirname, '..')
const backendDir = path.resolve(backendUiDir, '../backend')

console.log('🔄 Syncing admin extensions from backend...')
console.log('Backend UI dir:', backendUiDir)
console.log('Backend dir:', backendDir)

if (!fs.existsSync(backendDir)) {
  console.error('❌ Backend directory not found at:', backendDir)
  console.error('   Make sure you are running this from the monorepo root')
  process.exit(1)
}

const backendRoutes = path.join(backendDir, 'src', 'admin', 'routes')
const backendMenuItems = path.join(backendDir, 'src', 'admin', 'menu-items')
const uiRoutes = path.join(backendUiDir, 'routes')
const uiMenuItems = path.join(backendUiDir, 'src', 'admin', 'menu-items')

// Helper to recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source not found: ${src}`)
    return false
  }
  
  // Remove existing destination
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true })
  }
  
  // Create parent directory
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  
  // Copy directory
  fs.cpSync(src, dest, { recursive: true })
  console.log(`✅ Copied ${path.basename(src)} to ${path.relative(backendUiDir, dest)}`)
  return true
}

try {
  // Copy routes
  if (!copyDir(backendRoutes, uiRoutes)) {
    console.error('❌ Failed to copy routes')
    process.exit(1)
  }
  
  // Ensure src/admin exists
  const uiAdminDir = path.join(backendUiDir, 'src', 'admin')
  if (!fs.existsSync(uiAdminDir)) {
    fs.mkdirSync(uiAdminDir, { recursive: true })
  }
  
  // Copy menu-items
  if (!copyDir(backendMenuItems, uiMenuItems)) {
    console.warn('⚠️  Failed to copy menu-items (this is optional)')
  }
  
  console.log('✅ Sync complete!')
  console.log('💡 Remember to commit the updated files to backend-ui')
} catch (error) {
  console.error('❌ Error syncing admin extensions:', error.message)
  process.exit(1)
}

