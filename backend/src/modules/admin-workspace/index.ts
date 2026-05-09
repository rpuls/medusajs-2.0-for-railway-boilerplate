import { Module } from "@medusajs/framework/utils"

import AdminWorkspaceService from "./service"

export const ADMIN_WORKSPACE_MODULE = "admin_workspace"

export default Module(ADMIN_WORKSPACE_MODULE, {
  service: AdminWorkspaceService,
})
