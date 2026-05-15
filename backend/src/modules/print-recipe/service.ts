import { MedusaService } from "@medusajs/framework/utils"

import PrintRecipe from "./models/print-recipe"

class PrintRecipeModuleService extends MedusaService({
  PrintRecipe,
}) {}

export default PrintRecipeModuleService
