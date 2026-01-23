import { defineLink } from "@medusajs/framework/utils";
import ProductSalesModule from "../modules/product-sales";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
    ProductModule.linkable.productCollection,
    {
        linkable: ProductSalesModule.linkable.productSales,
        deleteCascade: true,
    }
);

