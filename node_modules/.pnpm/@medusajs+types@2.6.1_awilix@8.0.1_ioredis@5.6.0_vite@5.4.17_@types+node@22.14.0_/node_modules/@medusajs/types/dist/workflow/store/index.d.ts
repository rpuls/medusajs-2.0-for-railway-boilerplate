import { AdminUpdateStore } from "../../http";
import { CreateStoreDTO, FilterableStoreProps } from "../../store";
/**
 * The stores to create.
 */
export type CreateStoreWorkflowInput = Omit<CreateStoreDTO, "supported_currencies"> & {
    /**
     * The supported currencies of the store.
     */
    supported_currencies: {
        /**
         * The currency ISO 3 code.
         *
         * @example
         * usd
         */
        currency_code: string;
        /**
         * Whether this currency is the default currency in the store.
         */
        is_default?: boolean;
        /**
         * Whether prices in this currency are tax inclusive.
         *
         * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/pricing/tax-inclusive-pricing).
         */
        is_tax_inclusive?: boolean;
    }[];
};
/**
 * The data to update stores.
 */
export interface UpdateStoreWorkflowInput {
    /**
     * The filters to select the stores to update.
     */
    selector: FilterableStoreProps;
    /**
     * The data to update in the stores.
     */
    update: AdminUpdateStore;
}
//# sourceMappingURL=index.d.ts.map