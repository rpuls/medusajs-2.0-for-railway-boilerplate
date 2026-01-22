import { model } from "@medusajs/framework/utils";

export const ProductSales = model
    .define("product_sales", {
        id: model.id().primaryKey(),
        product_id: model.text().unique(),
        category_id: model.text().nullable(),
        selling_count: model.number().default(0),
    })
    .indexes([
        {
            on: ["product_id"],
            unique: true,
        },
        {
            on: ["category_id"],
        },
    ]);

export default ProductSales;

