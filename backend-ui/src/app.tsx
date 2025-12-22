import { DashboardApp } from "./dashboard-app"
import { DashboardPlugin } from "./dashboard-app/types"

import displayModule from "virtual:medusa/displays"
import formModule from "virtual:medusa/forms"
import i18nModule from "virtual:medusa/i18n"
import menuItemModule from "virtual:medusa/menu-items"
import routeModule from "virtual:medusa/routes"
import widgetModule from "virtual:medusa/widgets"

// Manually import and register the Agilo Analytics plugin
// This is needed for separated admin UI where vite plugin doesn't auto-discover it
import agiloPlugin from "@agilo/medusa-analytics-plugin/admin"

import "./index.css"

const localPlugin = {
  widgetModule,
  routeModule,
  displayModule,
  formModule,
  menuItemModule,
  i18nModule,
}

interface AppProps {
  plugins?: DashboardPlugin[]
}

function App({ plugins = [] }: AppProps) {
  // Debug: Log what the virtual modules contain
  console.log('🔍 Virtual modules debug:', {
    menuItems: menuItemModule?.menuItems || [],
    routes: routeModule?.routes || [],
    menuItemCount: menuItemModule?.menuItems?.length || 0,
    routeCount: routeModule?.routes?.length || 0,
  })

  // Merge Agilo Analytics plugin with local plugin
  // The plugin exports: { widgetModule, routeModule, menuItemModule, formModule, displayModule }
  // Each module has arrays (routes, menuItems, widgets, etc.) that need to be concatenated
  const agiloPluginModules = agiloPlugin || {}
  
  // Debug: Log what the plugin contains
  console.log('🔍 Agilo Analytics plugin:', {
    hasPlugin: !!agiloPlugin,
    pluginKeys: Object.keys(agiloPluginModules),
    routeCount: agiloPluginModules.routeModule?.routes?.length || 0,
    menuItemCount: agiloPluginModules.menuItemModule?.menuItems?.length || 0,
  })
  
  // Merge modules - some are Maps, some are arrays
  // The virtual modules from vite plugin are already processed, so we just need to pass them through
  // and add the plugin's modules as a separate plugin entry
  const mergedPlugin = {
    ...localPlugin,
  }
  
  // Add the Agilo plugin as a separate plugin entry
  // DashboardApp will merge multiple plugins automatically
  const pluginsToUse = [mergedPlugin, agiloPluginModules, ...plugins]

  const app = new DashboardApp({
    plugins: pluginsToUse,
  })

  return <div>{app.render()}</div>
}

export default App
