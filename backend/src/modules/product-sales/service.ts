import { MedusaService } from "@medusajs/framework/utils";
import ProductSales from "./models/product-sales";

class ProductSalesModuleService extends MedusaService({
    ProductSales,
}) { }

export default ProductSalesModuleService;

