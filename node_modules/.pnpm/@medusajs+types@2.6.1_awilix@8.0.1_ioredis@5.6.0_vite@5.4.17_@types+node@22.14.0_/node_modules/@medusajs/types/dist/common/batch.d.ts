export type LinkMethodRequest = {
    add?: string[];
    remove?: string[];
};
/**
 * Links to manage for a data model.
 *
 * For example, to add or remove links between a collection and products,
 * you pass in the `id` the collection's ID, in `add` the IDs of products
 * to create links to the collection, and in `remove` the IDs of products
 * to remove links from the collection.
 */
export type LinkWorkflowInput = {
    /**
     * The ID of the data model to create links to or remove links from.
     */
    id: string;
    /**
     * The IDs of the other data models to create links to the record specified in `id`.
     */
    add?: string[];
    /**
     * The IDs of the other data models to remove links from the record specified in `id`.
     */
    remove?: string[];
};
/**
 * Data to manage in bulk related to a model.
 */
export type BatchMethodRequest<TCreate, TUpdate, TDelete = string> = {
    /**
     * Records to create in bulk.
     */
    create?: TCreate[];
    /**
     * Records to update in bulk.
     */
    update?: TUpdate[];
    /**
     * Records to delete in bulk.
     */
    delete?: TDelete[];
};
/**
 * The result of a bulk operation related to a model.
 */
export type BatchMethodResponse<T> = {
    /**
     * The records that were created in the bulk operation.
     */
    created: T[];
    /**
     * The records that were updated in the bulk operation.
     */
    updated: T[];
    /**
     * The IDs of the records deleted in the bulk operation.
     */
    deleted: string[];
};
/**
 * Data to manage in bulk.
 */
export type BatchWorkflowInput<TCreate, TUpdate, TDelete = string> = BatchMethodRequest<TCreate, TUpdate, TDelete>;
/**
 * The data result of a bulk operation.
 */
export type BatchWorkflowOutput<T> = BatchMethodResponse<T>;
//# sourceMappingURL=batch.d.ts.map