import { OptionalProps } from "@mikro-orm/core";
export declare class BaseEntity {
    [OptionalProps]?: BaseEntity["id"] | BaseEntity["__prefix_id__"];
    private __prefix_id__?;
    constructor({ prefix_id }?: {
        prefix_id?: string;
    });
    id: string;
    onInitOrBeforeCreate_(): void;
    private generateEntityId;
}
//# sourceMappingURL=base-entity.d.ts.map