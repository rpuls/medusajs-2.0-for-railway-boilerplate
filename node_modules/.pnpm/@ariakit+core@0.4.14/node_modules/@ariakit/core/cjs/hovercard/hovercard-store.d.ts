import type { PopoverStoreFunctions, PopoverStoreOptions, PopoverStoreState } from "../popover/popover-store.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import type { SetState } from "../utils/types.ts";
/**
 * Creates a hovercard store.
 */
export declare function createHovercardStore(props?: HovercardStoreProps): HovercardStore;
export interface HovercardStoreState extends PopoverStoreState {
    /** @default "bottom" */
    placement: PopoverStoreState["placement"];
    /**
     * The amount of time in milliseconds to wait before showing and hiding the
     * popup. To control the delay for showing and hiding separately, use
     * [`showTimeout`](https://ariakit.org/reference/hovercard-provider#showtimeout)
     * and
     * [`hideTimeout`](https://ariakit.org/reference/hovercard-provider#hidetimeout).
     * @default 500
     */
    timeout: number;
    /**
     * The amount of time in milliseconds to wait before _showing_ the popup. It
     * defaults to the value passed to
     * [`timeout`](https://ariakit.org/reference/hovercard-provider#timeout).
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * - [Submenu with
     *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
     */
    showTimeout?: number;
    /**
     * The amount of time in milliseconds to wait before _hiding_ the popup. It
     * defaults to the value passed to
     * [`timeout`](https://ariakit.org/reference/hovercard-provider#timeout).
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * - [Tooltip with Framer
     *   Motion](https://ariakit.org/examples/tooltip-framer-motion)
     */
    hideTimeout?: number;
    /**
     * Whether the popup or an element inside it should be focused when it is
     * shown.
     * @default false
     */
    autoFocusOnShow: boolean;
}
export interface HovercardStoreFunctions extends PopoverStoreFunctions {
    /**
     * Sets the `autoFocusOnShow` state.
     *
     * Live examples:
     * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
     */
    setAutoFocusOnShow: SetState<HovercardStoreState["autoFocusOnShow"]>;
}
export interface HovercardStoreOptions extends StoreOptions<HovercardStoreState, "placement" | "timeout" | "showTimeout" | "hideTimeout">, PopoverStoreOptions {
}
export interface HovercardStoreProps extends HovercardStoreOptions, StoreProps<HovercardStoreState> {
}
export interface HovercardStore extends HovercardStoreFunctions, Store<HovercardStoreState> {
}
