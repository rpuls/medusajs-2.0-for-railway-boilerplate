import { DateTimeProperty } from "../../properties/date-time";
import { NullableModifier } from "../../properties/nullable";
export type DMLSchemaDefaults = {
    created_at: DateTimeProperty;
    updated_at: DateTimeProperty;
    deleted_at: NullableModifier<Date, DateTimeProperty>;
};
export declare function createDefaultProperties(): DMLSchemaDefaults;
//# sourceMappingURL=create-default-properties.d.ts.map