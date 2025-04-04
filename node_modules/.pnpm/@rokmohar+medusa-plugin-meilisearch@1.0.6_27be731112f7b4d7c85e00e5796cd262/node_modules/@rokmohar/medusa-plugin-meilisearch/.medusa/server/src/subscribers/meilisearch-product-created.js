"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = meilisearchProductCreatedHandler;
const utils_1 = require("@medusajs/utils");
async function meilisearchProductCreatedHandler({ event: { data }, container, }) {
    const productId = data.id;
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const meilisearchService = container.resolve('meilisearch');
    const product = await productModuleService.retrieveProduct(productId, {
        relations: ['*'],
    });
    await meilisearchService.addDocuments('products', [product], utils_1.SearchUtils.indexTypes.PRODUCTS);
}
exports.config = {
    event: 'product.created',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVpbGlzZWFyY2gtcHJvZHVjdC1jcmVhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL21laWxpc2VhcmNoLXByb2R1Y3QtY3JlYXRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxtREFjQztBQWpCRCwyQ0FBc0Q7QUFHdkMsS0FBSyxVQUFVLGdDQUFnQyxDQUFDLEVBQzdELEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQTtJQUV6QixNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQy9ELE1BQU0sa0JBQWtCLEdBQXVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFL0UsTUFBTSxPQUFPLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFO1FBQ3BFLFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztLQUNqQixDQUFDLENBQUE7SUFFRixNQUFNLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxtQkFBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMvRixDQUFDO0FBRVksUUFBQSxNQUFNLEdBQXFCO0lBQ3RDLEtBQUssRUFBRSxpQkFBaUI7Q0FDekIsQ0FBQSJ9