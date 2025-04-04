"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = meilisearchProductUpdatedHandler;
const utils_1 = require("@medusajs/utils");
async function meilisearchProductUpdatedHandler({ event: { data }, container, }) {
    const productId = data.id;
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const meilisearchService = container.resolve('meilisearch');
    const product = await productModuleService.retrieveProduct(productId, {
        relations: ['*'],
    });
    if (product.status === 'published') {
        // If status is "published", add or update the document in MeiliSearch
        await meilisearchService.addDocuments('products', [product], utils_1.SearchUtils.indexTypes.PRODUCTS);
    }
    else {
        // If status is not "published", remove the document from MeiliSearch
        await meilisearchService.deleteDocument('products', productId);
    }
}
exports.config = {
    event: 'product.updated',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVpbGlzZWFyY2gtcHJvZHVjdC11cGRhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL21laWxpc2VhcmNoLXByb2R1Y3QtdXBkYXRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxtREFvQkM7QUF2QkQsMkNBQXNEO0FBR3ZDLEtBQUssVUFBVSxnQ0FBZ0MsQ0FBQyxFQUM3RCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEdBQ3NCO0lBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUE7SUFFekIsTUFBTSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUMvRCxNQUFNLGtCQUFrQixHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRS9FLE1BQU0sT0FBTyxHQUFHLE1BQU0sb0JBQW9CLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRTtRQUNwRSxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7S0FDakIsQ0FBQyxDQUFBO0lBRUYsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRSxDQUFDO1FBQ25DLHNFQUFzRTtRQUN0RSxNQUFNLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxtQkFBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMvRixDQUFDO1NBQU0sQ0FBQztRQUNOLHFFQUFxRTtRQUNyRSxNQUFNLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDaEUsQ0FBQztBQUNILENBQUM7QUFFWSxRQUFBLE1BQU0sR0FBcUI7SUFDdEMsS0FBSyxFQUFFLGlCQUFpQjtDQUN6QixDQUFBIn0=