import { Module } from "@medusajs/framework/utils"
import AussiePacificService from "./service"

export const AUSSIEPACIFIC_MODULE = "aussiepacific"

export default Module(AUSSIEPACIFIC_MODULE, {
  service: AussiePacificService,
})

export { AussiePacificService }
export * from "./types"
