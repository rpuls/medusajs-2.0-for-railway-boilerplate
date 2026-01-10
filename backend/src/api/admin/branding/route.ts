import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BRANDING_MODULE } from "../../../modules/branding";
import BrandingModuleService from "../../../modules/branding/service";
import { PostAdminUpdateBrandingType } from "./validators";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandingModuleService: BrandingModuleService =
    req.scope.resolve(BRANDING_MODULE);

  const config = await brandingModuleService.getConfig();

  if (!config) {
    return res.status(404).json({
      message: "Branding configuration not found",
    });
  }

  res.json({ branding: config });
};

export const POST = async (
  req: MedusaRequest<PostAdminUpdateBrandingType>,
  res: MedusaResponse
) => {
  const brandingModuleService: BrandingModuleService =
    req.scope.resolve(BRANDING_MODULE);

  const updatedConfig = await brandingModuleService.updateConfig(
    req.validatedBody
  );

  res.json({ branding: updatedConfig });
};

export const PUT = async (
  req: MedusaRequest<PostAdminUpdateBrandingType>,
  res: MedusaResponse
) => {
  const brandingModuleService: BrandingModuleService =
    req.scope.resolve(BRANDING_MODULE);

  const updatedConfig = await brandingModuleService.updateConfig(
    req.validatedBody
  );

  res.json({ branding: updatedConfig });
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandingModuleService: BrandingModuleService =
    req.scope.resolve(BRANDING_MODULE);

  await brandingModuleService.deleteConfig();

  res.status(204).send();
};
