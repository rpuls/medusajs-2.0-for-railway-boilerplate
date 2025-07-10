import { ModuleProviderExports } from "@medusajs/framework/types";
import InPostFulfillmentProviderService from "./service";

const services = [InPostFulfillmentProviderService];

const providerExport: ModuleProviderExports = {
  services,
};

export default providerExport;
