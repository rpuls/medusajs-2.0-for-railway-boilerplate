#!/usr/bin/env node

/**
 * Setup script to create symlinks for admin routes and menu items
 * from the backend project to backend-ui for the admin-vite-plugin to discover.
 * 
 * This script runs before the build to ensure symlinks exist in production.
 */

const fs = require('fs')
const path = require('path')

const backendUiDir = process.cwd()
const backendDir = path.resolve(backendUiDir, '../backend')

console.log('🔗 Setting up admin extension symlinks...')
console.log('Backend UI dir:', backendUiDir)
console.log('Backend dir:', backendDir)

// Check if backend directory exists
if (!fs.existsSync(backendDir)) {
  console.warn('⚠️  Backend directory not found at:', backendDir)
  console.warn('   Symlinks will not be created. This is OK if backend is not in monorepo.')
  process.exit(0)
}

// Paths
const backendRoutes = path.join(backendDir, 'src', 'admin', 'routes')
const backendMenuItems = path.join(backendDir, 'src', 'admin', 'menu-items')
const uiRoutes = path.join(backendUiDir, 'routes')
const uiMenuItems = path.join(backendUiDir, 'src', 'admin', 'menu-items')

// Helper function to safely create/update symlink
function createSymlink(target, linkPath, name) {
  try {
    // Check if link already exists
    if (fs.existsSync(linkPath) || fs.lstatSync(linkPath)) {
      try {
        const stats = fs.lstatSync(linkPath)
        if (stats.isSymbolicLink()) {
          // Check if it points to the correct target
          const currentTarget = fs.readlinkSync(linkPath)
          const resolvedCurrent = path.resolve(path.dirname(linkPath), currentTarget)
          const resolvedTarget = path.resolve(target)
          
          if (resolvedCurrent === resolvedTarget) {
            console.log(`✅ ${name} symlink already exists and is correct`)
            return true
          } else {
            // Remove incorrect symlink
            fs.unlinkSync(linkPath)
            console.log(`🔄 Removed incorrect ${name} symlink (was pointing to ${currentTarget})`)
          }
        } else {
          // It's a real directory/file, not a symlink
          console.warn(`⚠️  ${name} exists and is not a symlink. Skipping to avoid overwriting.`)
          return false
        }
      } catch (err) {
        // If lstatSync fails, the file might not exist, continue to create
        if (err.code !== 'ENOENT') {
          throw err
        }
      }
    }
    
    // Create the symlink
    fs.symlinkSync(target, linkPath, 'dir')
    console.log(`✅ Created symlink: ${name} -> ${target}`)
    return true
  } catch (error) {
    if (error.code === 'EEXIST') {
      // Try to remove and recreate
      try {
        fs.unlinkSync(linkPath)
        fs.symlinkSync(target, linkPath, 'dir')
        console.log(`✅ Recreated symlink: ${name} -> ${target}`)
        return true
      } catch (retryError) {
        console.error(`❌ Error recreating ${name} symlink:`, retryError.message)
        return false
      }
    }
    console.error(`❌ Error creating ${name} symlink:`, error.message)
    return false
  }
}

// Create symlinks
try {
  let success = true
  
  // Create routes symlink
  if (fs.existsSync(backendRoutes)) {
    if (!createSymlink(backendRoutes, uiRoutes, 'routes')) {
      success = false
    }
  } else {
    console.warn('⚠️  Backend routes directory not found:', backendRoutes)
    success = false
  }

  // Create src/admin directory if it doesn't exist
  const uiAdminDir = path.join(backendUiDir, 'src', 'admin')
  if (!fs.existsSync(uiAdminDir)) {
    fs.mkdirSync(uiAdminDir, { recursive: true })
  }

  // Create menu-items symlink
  if (fs.existsSync(backendMenuItems)) {
    if (!createSymlink(backendMenuItems, uiMenuItems, 'menu-items')) {
      success = false
    }
  } else {
    console.warn('⚠️  Backend menu-items directory not found:', backendMenuItems)
    // Don't fail if menu-items doesn't exist, it's optional
  }

  if (success) {
    console.log('✅ Symlinks setup complete!')
  } else {
    console.warn('⚠️  Some symlinks could not be created, but continuing...')
  }
} catch (error) {
  console.error('❌ Error setting up symlinks:', error.message)
  process.exit(1)
}

