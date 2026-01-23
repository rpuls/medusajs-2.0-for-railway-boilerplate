import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query");
    const logger = req.scope.resolve("logger");
    const { category_id, collection_id } = req.validatedQuery;

    // Build filters: category_id takes priority over collection_id
    const filters: any = {};
    if (category_id) {
        filters.category_id = category_id;
    } else if (collection_id) {
        filters.collection_id = collection_id;
    }

    // Query product sales with joins to products, variants, and calculated_prices
    // Order by selling_count DESC
    const { data: productSales, metadata } = await query.graph({
        entity: "product_sales",
        filters,
        pagination: {
            ...req.queryConfig?.pagination,
            order: {
                selling_count: "DESC",
            },
        },
        ...req.queryConfig,
    });

    res.json({
        product_sales: productSales,
        count: metadata?.count,
        limit: metadata?.take,
        offset: metadata?.skip,
    });
};

