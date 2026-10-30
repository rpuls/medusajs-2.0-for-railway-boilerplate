import { Module } from '@medusajs/framework/utils'
import StoreMcpModuleService from './service'

export const STORE_MCP_MODULE = 'storeMcp'

export default Module(STORE_MCP_MODULE, {
  service: StoreMcpModuleService,
})
