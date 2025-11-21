#!/usr/bin/env node

/**
 * Setup script to create symlinks (or copy) admin routes and menu items
 * from the backend project to backend-ui for the admin-vite-plugin to discover.
 * 
 * - In local dev: Creates symlinks (maintains single source of truth)
 * - In Railway/production: Copies files (backend not available in build context)
 * 
 * This script runs before the build to ensure admin extensions are available.
 */

const fs = require('fs')
const path = require('path')

const backendUiDir = process.cwd()
const backendDir = path.resolve(backendUiDir, '../backend')

console.log('🔗 Setting up admin extensions...')
console.log('Backend UI dir:', backendUiDir)
console.log('Backend dir:', backendDir)

const backendExists = fs.existsSync(backendDir)
const useSymlinks = backendExists // Use symlinks if backend exists, otherwise we'll need to copy from git

if (!backendExists) {
  console.warn('⚠️  Backend directory not found at:', backendDir)
  console.warn('   This is expected in Railway builds (rootDirectory: backend-ui)')
  console.warn('   Admin files should be committed to backend-ui for production builds')
  // Don't exit - we'll check if files already exist in backend-ui
}

// Paths
const backendRoutes = path.join(backendDir, 'src', 'admin', 'routes')
const backendMenuItems = path.join(backendDir, 'src', 'admin', 'menu-items')
const uiRoutes = path.join(backendUiDir, 'routes')
const uiMenuItems = path.join(backendUiDir, 'src', 'admin', 'menu-items')

// Helper function to recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return false
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
  
  return true
}

// Helper function to safely create symlink or copy
function setupAdminFiles(source, target, name) {
  try {
    // Check if target already exists
    if (fs.existsSync(target)) {
      try {
        const stats = fs.lstatSync(target)
        if (stats.isSymbolicLink()) {
          // Check if symlink points to correct target
          const currentTarget = fs.readlinkSync(target)
          const resolvedCurrent = path.resolve(path.dirname(target), currentTarget)
          const resolvedSource = path.resolve(source)
          
          if (resolvedCurrent === resolvedSource) {
            console.log(`✅ ${name} symlink already exists and is correct`)
            return true
          } else {
            // Remove incorrect symlink
            fs.unlinkSync(target)
            console.log(`🔄 Removed incorrect ${name} symlink`)
          }
        } else {
          // It's a real directory - check if it has content
          const files = fs.readdirSync(target)
          if (files.length > 0) {
            console.log(`✅ ${name} directory already exists with content (${files.length} items)`)
            return true // Already copied, skip
          }
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }
    }
    
    // Create symlink if backend exists, otherwise copy
    if (useSymlinks && fs.existsSync(source)) {
      fs.symlinkSync(source, target, 'dir')
      console.log(`✅ Created symlink: ${name} -> ${source}`)
    } else if (fs.existsSync(source)) {
      // Copy directory
      if (copyDir(source, target)) {
        console.log(`✅ Copied ${name} directory from ${source}`)
      } else {
        console.warn(`⚠️  Could not copy ${name} from ${source}`)
        return false
      }
    } else {
      console.warn(`⚠️  Source ${name} not found at: ${source}`)
      return false
    }
    
    return true
  } catch (error) {
    console.error(`❌ Error setting up ${name}:`, error.message)
    return false
  }
}

// Setup admin files
try {
  let success = true
  
  // Setup routes
  if (!setupAdminFiles(backendRoutes, uiRoutes, 'routes')) {
    // Check if routes already exist in backend-ui (committed for Railway)
    if (fs.existsSync(uiRoutes)) {
      console.log('✅ Routes directory already exists in backend-ui')
    } else {
      console.warn('⚠️  Routes not found. Make sure backend/src/admin/routes is available or committed to backend-ui')
      success = false
    }
  }

  // Create src/admin directory if it doesn't exist
  const uiAdminDir = path.join(backendUiDir, 'src', 'admin')
  if (!fs.existsSync(uiAdminDir)) {
    fs.mkdirSync(uiAdminDir, { recursive: true })
  }

  // Setup menu-items (optional)
  if (!setupAdminFiles(backendMenuItems, uiMenuItems, 'menu-items')) {
    // Check if menu-items already exist in backend-ui
    if (fs.existsSync(uiMenuItems)) {
      console.log('✅ Menu-items directory already exists in backend-ui')
    } else {
      console.warn('⚠️  Menu-items not found (this is optional)')
    }
  }

  if (success || fs.existsSync(uiRoutes)) {
    console.log('✅ Admin extensions setup complete!')
  } else {
    console.warn('⚠️  Admin extensions may not be available. Continuing build...')
  }
} catch (error) {
  console.error('❌ Error setting up admin extensions:', error.message)
  // Don't exit with error - allow build to continue even if admin extensions fail
  console.warn('⚠️  Continuing build without admin extensions...')
}

