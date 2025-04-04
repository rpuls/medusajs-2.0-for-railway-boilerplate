import * as Core from "@ariakit/core/popover/popover-store";
import type { DialogStoreFunctions, DialogStoreOptions, DialogStoreState } from "../dialog/dialog-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function usePopoverStoreProps<T extends Core.PopoverStore>(store: T, update: () => void, props: PopoverStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
};
/**
 * Creates a popover store to control the state of
 * [Popover](https://ariakit.org/components/popover) components.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <PopoverDisclosure store={popover}>Disclosure</PopoverDisclosure>
 * <Popover store={popover}>Popover</Popover>
 * ```
 */
export declare function usePopoverStore(props?: PopoverStoreProps): PopoverStore;
export interface PopoverStoreState extends Core.PopoverStoreState, DialogStoreState {
}
export interface PopoverStoreFunctions extends Omit<Core.PopoverStoreFunctions, "disclosure">, DialogStoreFunctions {
}
export interface PopoverStoreOptions extends Omit<Core.PopoverStoreOptions, "disclosure">, DialogStoreOptions {
}
export interface PopoverStoreProps extends PopoverStoreOptions, Omit<Core.PopoverStoreProps, "disclosure"> {
}
export interface PopoverStore extends PopoverStoreFunctions, Omit<Store<Core.PopoverStore>, "disclosure"> {
}
