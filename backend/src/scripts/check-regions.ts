import { MedusaContainer } from "@medusajs/framework";
import { IRegionModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: { container: MedusaContainer }) {
  const regionModuleService: IRegionModuleService = container.resolve(Modules.REGION);
  
  try {
    const regions = await regionModuleService.list({});
    console.log("Available Regions:", JSON.stringify(regions, null, 2));
    
    if (regions.length === 0) {
      console.log("No regions found. You should create regions in the Medusa Admin.");
    } else {
      console.log(`Found ${regions.length} regions.`);
      
      // Check if regions have countries
      for (const region of regions) {
        console.log(`Region: ${region.name} (${region.id})`);
        if (region.countries && region.countries.length > 0) {
          console.log(`  Countries: ${region.countries.map(c => c.display_name).join(', ')}`);
        } else {
          console.log("  No countries associated with this region.");
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving regions:", error);
  }
}
