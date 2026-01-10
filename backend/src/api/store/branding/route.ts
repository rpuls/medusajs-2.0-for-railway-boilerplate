import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BRANDING_MODULE } from "../../../modules/branding";
import BrandingModuleService from "../../../modules/branding/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandingModuleService: BrandingModuleService =
    req.scope.resolve(BRANDING_MODULE);

  // Service handles returning default config if none exists
  const config = await brandingModuleService.getConfigOrDefault();

  res.json({ branding: config });
};
