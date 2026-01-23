import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { PRODUCT_SALES_MODULE } from "../modules/product-sales";
import ProductSalesModuleService from "../modules/product-sales/service";
import { OrderDTO, LinkDefinition } from "@medusajs/framework/types";

type StepInput = {
    order: OrderDTO;
};

const updateProductSalesStep = createStep(
    "update-product-sales-step",
    async function updateProductSalesHandler({ order }: StepInput, { container }) {
        const logger = container.resolve("logger");
        const productSalesService: ProductSalesModuleService = container.resolve(
            PRODUCT_SALES_MODULE
        );
        const link = container.resolve("link");

        logger.info(`🔵 Updating product sales for order ${order.id}`);

        const items = order.items || [];
        logger.info(`🔵 Processing ${items.length} items for order ${order.id}`);

        let processedCount = 0;
        let skippedCount = 0;

        for (const item of items) {
            try {
                const success = await processOrderItem(
                    item,
                    productSalesService,
                    link,
                    logger
                );
                if (success) processedCount++;
                else skippedCount++;

            } catch (error) {
                logger.error(
                    `🔴 Error updating product sales for product ${item.product_id}: ${error instanceof Error ? error.message : String(error)}`,
                    error
                );
                throw error;
            }
        }

        logger.info(
            `🟢 Completed product sales update for order ${order.id}: ${processedCount} processed, ${skippedCount} skipped`
        );
        return new StepResponse(null);
    }
);

type WorkflowInput = {
    order_id: string;
};

export const updateProductSalesWorkflow = createWorkflow(
    "update-product-sales-workflow",
    ({ order_id }: WorkflowInput) => {
        const { data: orders } = useQueryGraphStep({
            entity: "order",
            fields: ["id", "items.*", "items.product.*", "items.product.categories.*"],
            filters: {
                id: order_id,
            },
        });

        updateProductSalesStep({
            order: orders[0],
        } as StepInput);
    }
);

// Helper: Extract category ID from order item
function extractCategoryId(item: any): string | null {
    const product = item?.product;
    return product?.categories?.[0]?.id || null;
}

// Helper: Extract collection ID from order item
function extractCollectionId(item: any): string | null {
    const product = item?.product;
    return product?.collection_id || null;
}

// Helper: Create product-to-product-sales link
function createProductLink(productId: string, productSalesId: string): LinkDefinition {
    return {
        [Modules.PRODUCT]: {
            product_id: productId,
        },
        [PRODUCT_SALES_MODULE]: {
            product_sales_id: productSalesId,
        },
    };
}

// Helper: Create category-to-product-sales link
function createCategoryLink(categoryId: string, productSalesId: string): LinkDefinition {
    return {
        [Modules.PRODUCT]: {
            product_category_id: categoryId,
        },
        [PRODUCT_SALES_MODULE]: {
            product_sales_id: productSalesId,
        },
    };
}

// Helper: Create collection-to-product-sales link
function createCollectionLink(collectionId: string, productSalesId: string): LinkDefinition {
    return {
        [Modules.PRODUCT]: {
            product_collection_id: collectionId,
        },
        [PRODUCT_SALES_MODULE]: {
            product_sales_id: productSalesId,
        },
    };
}

// Helper: Safely create a link (handles existing links gracefully)
async function createLinkSafely(
    link: any,
    linkDefinition: LinkDefinition,
    description: string,
    logger: any
): Promise<void> {
    try {
        await link.create([linkDefinition]);
        logger.info(`🔵 Linked ${description}`);
    } catch (error) {
        logger.warn(
            `🟡 Link ${description} may already exist: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

// Helper: Upsert product sales record
async function upsertProductSales(
    productSalesService: ProductSalesModuleService,
    productId: string,
    categoryId: string | null,
    collectionId: string | null,
    quantity: number,
    logger: any
): Promise<string> {
    const existing = await productSalesService.listProductSales(
        { product_id: productId },
        { take: 1 }
    );

    if (existing.length) {
        const current = existing[0];
        const newCount = current.selling_count + quantity;
        const updateData: any = {
            id: current.id,
            selling_count: newCount,
        };

        // Update category_id if it's missing
        if (categoryId && !current.category_id) {
            updateData.category_id = categoryId;
        }

        // Update collection_id if it's missing
        if (collectionId && !current.collection_id) {
            updateData.collection_id = collectionId;
        }

        await productSalesService.updateProductSales([updateData]);
        logger.info(
            `🔵 Updated product sales for product ${productId}: ${current.selling_count} -> ${newCount} (added ${quantity})`
        );
        return current.id;
    } else {
        const created = await productSalesService.createProductSales({
            product_id: productId,
            category_id: categoryId,
            collection_id: collectionId,
            selling_count: quantity,
        });
        const categoryInfo = categoryId ? ` and category ${categoryId}` : "";
        const collectionInfo = collectionId ? ` and collection ${collectionId}` : "";
        logger.info(
            `🔵 Created new product sales record for product ${productId} with count ${quantity}${categoryInfo}${collectionInfo}`
        );
        return created.id;
    }
}

// Helper: Process a single order item
async function processOrderItem(
    item: any,
    productSalesService: ProductSalesModuleService,
    link: any,
    logger: any
): Promise<boolean> {
    const productId = item.product_id;
    const quantity = item.quantity || 0;

    // Validate item
    if (!productId || !quantity || quantity === 0) {
        logger.warn(
            `🟡 Skipping item ${item.id}: missing product_id or invalid quantity (product_id: ${productId}, quantity: ${quantity})`
        );
        return false;
    }

    // Extract category and collection
    const categoryId = extractCategoryId(item);
    if (!categoryId) {
        logger.warn(`🟡 Product ${productId} has no category, skipping category link`);
    }

    const collectionId = extractCollectionId(item);
    if (!collectionId) {
        logger.warn(`🟡 Product ${productId} has no collection, skipping collection link`);
    }

    // Upsert product sales record
    const productSalesId = await upsertProductSales(
        productSalesService,
        productId,
        categoryId,
        collectionId,
        quantity,
        logger
    );

    // Create links
    await createLinkSafely(
        link,
        createProductLink(productId, productSalesId),
        `product ${productId} to product sales ${productSalesId}`,
        logger
    );

    if (categoryId) {
        await createLinkSafely(
            link,
            createCategoryLink(categoryId, productSalesId),
            `category ${categoryId} to product sales ${productSalesId}`,
            logger
        );
    }

    if (collectionId) {
        await createLinkSafely(
            link,
            createCollectionLink(collectionId, productSalesId),
            `collection ${collectionId} to product sales ${productSalesId}`,
            logger
        );
    }

    return true;
}