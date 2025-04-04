import * as Core from "@ariakit/core/hovercard/hovercard-store";
import type { PopoverStoreFunctions, PopoverStoreOptions, PopoverStoreState } from "../popover/popover-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useHovercardStoreProps<T extends Core.HovercardStore>(store: T, update: () => void, props: HovercardStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
};
/**
 * Creates a hovercard store to control the state of
 * [Hovercard](https://ariakit.org/reference/hovercard) components.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardStore({ placement: "top" });
 *
 * <HovercardAnchor store={hovercard}>@username</HovercardAnchor>
 * <Hovercard store={hovercard}>Details</Hovercard>
 * ```
 */
export declare function useHovercardStore(props?: HovercardStoreProps): HovercardStore;
export interface HovercardStoreState extends Core.HovercardStoreState, PopoverStoreState {
}
export interface HovercardStoreFunctions extends Omit<Core.HovercardStoreFunctions, "disclosure">, PopoverStoreFunctions {
}
export interface HovercardStoreOptions extends Omit<Core.HovercardStoreOptions, "disclosure">, PopoverStoreOptions {
}
export interface HovercardStoreProps extends HovercardStoreOptions, Omit<Core.HovercardStoreProps, "disclosure"> {
}
export interface HovercardStore extends HovercardStoreFunctions, Omit<Store<Core.HovercardStore>, "disclosure"> {
}
