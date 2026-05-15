import { MedusaService } from "@medusajs/framework/utils"

import Organisation from "./models/organisation"
import OrganisationMember from "./models/organisation-member"

class OrganisationModuleService extends MedusaService({
  Organisation,
  OrganisationMember,
}) {}

export default OrganisationModuleService
