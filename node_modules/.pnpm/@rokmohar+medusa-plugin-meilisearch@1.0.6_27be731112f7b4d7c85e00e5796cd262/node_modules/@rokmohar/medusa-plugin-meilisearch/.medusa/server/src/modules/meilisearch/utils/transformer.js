"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformProduct = void 0;
const utils_1 = require("@medusajs/utils");
const prefix = `variant`;
const transformProduct = (product) => {
    const transformedProduct = { ...product };
    const initialObj = utils_1.variantKeys.reduce((obj, key) => {
        obj[`${prefix}_${key}`] = [];
        return obj;
    }, {});
    initialObj[`${prefix}_options_value`] = [];
    const flattenedVariantFields = (product.variants ?? []).reduce((obj, variant) => {
        utils_1.variantKeys.forEach((k) => {
            if (k === 'options' && variant[k]) {
                const values = variant[k].map((option) => option.value);
                obj[`${prefix}_options_value`] = obj[`${prefix}_options_value`].concat(values);
                return;
            }
            return variant[k] && obj[`${prefix}_${k}`].push(variant[k]);
        });
        return obj;
    }, initialObj);
    transformedProduct.type_value = product.type && product.type.value;
    transformedProduct.collection_title = product.collection && product.collection.title;
    transformedProduct.collection_handle = product.collection && product.collection.handle;
    transformedProduct.tags_value = product.tags ? product.tags.map((t) => t.value) : [];
    transformedProduct.categories = (product?.categories || []).map((c) => c.name);
    return {
        ...transformedProduct,
        ...flattenedVariantFields,
    };
};
exports.transformProduct = transformProduct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWlsaXNlYXJjaC91dGlscy90cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBNkM7QUFFN0MsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFBO0FBRWpCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFZLEVBQUUsRUFBRTtJQUMvQyxNQUFNLGtCQUFrQixHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQTZCLENBQUE7SUFFcEUsTUFBTSxVQUFVLEdBQUcsbUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDakQsR0FBRyxDQUFDLEdBQUcsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzVCLE9BQU8sR0FBRyxDQUFBO0lBQ1osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sVUFBVSxDQUFDLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUUxQyxNQUFNLHNCQUFzQixHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDOUUsbUJBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN4QixJQUFJLENBQUMsS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDdkQsR0FBRyxDQUFDLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBQzlFLE9BQU07WUFDUixDQUFDO1lBQ0QsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdELENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFFZCxrQkFBa0IsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNsRSxrQkFBa0IsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFBO0lBQ3BGLGtCQUFrQixDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUE7SUFDdEYsa0JBQWtCLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNwRixrQkFBa0IsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRTlFLE9BQU87UUFDTCxHQUFHLGtCQUFrQjtRQUNyQixHQUFHLHNCQUFzQjtLQUMxQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBL0JZLFFBQUEsZ0JBQWdCLG9CQStCNUIifQ==