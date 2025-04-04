import { AdminProduct } from "../../product";
import { BaseProductCategory } from "../common";
export interface AdminProductCategory extends Omit<BaseProductCategory, "products" | "category_children" | "parent_category"> {
    /**
     * The category's children.
     */
    category_children: AdminProductCategory[];
    /**
     * The parent category's details.
     */
    parent_category: AdminProductCategory | null;
    /**
     * The products that belong to this category.
     */
    products?: AdminProduct[];
}
//# sourceMappingURL=entities.d.ts.map