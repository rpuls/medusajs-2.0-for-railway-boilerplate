import type { WrapElement } from "../../utils/types.ts";
import type { DialogStore } from "../dialog-store.ts";
export declare function useNestedDialogs(store: DialogStore): {
    wrapElement: WrapElement;
    nestedDialogs: DialogStore[];
};
