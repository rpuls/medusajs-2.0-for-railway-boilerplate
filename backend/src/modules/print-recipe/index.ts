import { Module } from "@medusajs/framework/utils"

import PrintRecipeModuleService from "./service"

export const PRINT_RECIPE_MODULE = "print_recipe"

export default Module(PRINT_RECIPE_MODULE, {
  service: PrintRecipeModuleService,
})
