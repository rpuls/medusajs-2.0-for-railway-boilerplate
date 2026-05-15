import { Module } from "@medusajs/framework/utils"

import OrganisationModuleService from "./service"

export const ORGANISATION_MODULE = "organisation"

export default Module(ORGANISATION_MODULE, {
  service: OrganisationModuleService,
})
