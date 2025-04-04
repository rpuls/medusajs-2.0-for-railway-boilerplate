import { Context, DAL, FindConfig, InferEntityType, ProductTypes } from "@medusajs/framework/types";
import { ProductCategory } from "../models";
import { UpdateCategoryInput } from "../types";
type InjectedDependencies = {
    productCategoryRepository: DAL.TreeRepositoryService;
};
export default class ProductCategoryService {
    protected readonly productCategoryRepository_: DAL.TreeRepositoryService;
    constructor({ productCategoryRepository }: InjectedDependencies);
    retrieve(productCategoryId: string, config?: FindConfig<ProductTypes.ProductCategoryDTO>, sharedContext?: Context): Promise<InferEntityType<typeof ProductCategory>>;
    list(filters?: ProductTypes.FilterableProductCategoryProps, config?: FindConfig<ProductTypes.ProductCategoryDTO>, sharedContext?: Context): Promise<InferEntityType<typeof ProductCategory>[]>;
    listAndCount(filters?: ProductTypes.FilterableProductCategoryProps, config?: FindConfig<ProductTypes.ProductCategoryDTO>, sharedContext?: Context): Promise<[InferEntityType<typeof ProductCategory>[], number]>;
    create(data: ProductTypes.CreateProductCategoryDTO[], sharedContext?: Context): Promise<InferEntityType<typeof ProductCategory>[]>;
    update(data: UpdateCategoryInput[], sharedContext?: Context): Promise<InferEntityType<typeof ProductCategory>[]>;
    delete(ids: string[], sharedContext?: Context): Promise<string[]>;
    softDelete(ids: string[], sharedContext?: Context): Promise<Record<string, string[]> | void>;
    restore(ids: string[], sharedContext?: Context): Promise<Record<string, string[]> | void>;
}
export {};
//# sourceMappingURL=product-category.d.ts.map