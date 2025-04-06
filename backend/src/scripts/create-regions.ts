import { MedusaContainer } from "@medusajs/framework";
import { IRegionModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: { container: MedusaContainer }) {
  const regionModuleService: IRegionModuleService = container.resolve(Modules.REGION);
  
  try {
    console.log("Creating regions...");
    
    // Create US region
    const usRegion = await regionModuleService.create({
      name: "United States",
      currency_code: "usd",
      countries: [{ iso_2: "us" }],
    });
    console.log("Created US region:", usRegion);
    
    // Create Europe region
    const euRegion = await regionModuleService.create({
      name: "Europe",
      currency_code: "eur",
      countries: [
        { iso_2: "de" },
        { iso_2: "fr" },
        { iso_2: "es" },
        { iso_2: "it" },
        { iso_2: "gb" },
      ],
    });
    console.log("Created Europe region:", euRegion);
    
    console.log("Regions created successfully!");
  } catch (error) {
    console.error("Error creating regions:", error);
  }
}
