import { Module } from "@medusajs/framework/utils";
import BrandingModuleService from "./service";

export const BRANDING_MODULE = "branding";

export default Module(BRANDING_MODULE, {
  service: BrandingModuleService,
});

