import { DAL, FindConfig, InferRepositoryReturnType } from "@medusajs/types";
export declare function buildQuery<const T = any>(filters?: Record<string, any>, config?: FindConfig<InferRepositoryReturnType<T>> & {
    primaryKeyFields?: string | string[];
}): Required<DAL.FindOptions<T>>;
//# sourceMappingURL=build-query.d.ts.map