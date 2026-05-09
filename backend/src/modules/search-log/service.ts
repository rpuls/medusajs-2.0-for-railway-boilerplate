import { MedusaService } from "@medusajs/framework/utils"

import SearchEvent from "./models/search-event"

class SearchLogModuleService extends MedusaService({
  SearchEvent,
}) {}

export default SearchLogModuleService
