import * as Core from "@ariakit/core/tooltip/tooltip-store";
import type { HovercardStoreFunctions, HovercardStoreOptions, HovercardStoreState } from "../hovercard/hovercard-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useTooltipStoreProps<T extends Core.TooltipStore>(store: T, update: () => void, props: TooltipStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
};
/**
 * Creates a tooltip store to control the state of
 * [Tooltip](https://ariakit.org/components/tooltip) components.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipStore();
 *
 * <TooltipAnchor store={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip store={tooltip}>Tooltip</Tooltip>
 * ```
 */
export declare function useTooltipStore(props?: TooltipStoreProps): TooltipStore;
export interface TooltipStoreState extends Core.TooltipStoreState, HovercardStoreState {
}
export interface TooltipStoreFunctions extends Omit<Core.TooltipStoreFunctions, "disclosure">, HovercardStoreFunctions {
}
export interface TooltipStoreOptions extends Omit<Core.TooltipStoreOptions, "disclosure">, HovercardStoreOptions {
}
export interface TooltipStoreProps extends TooltipStoreOptions, Omit<Core.TooltipStoreProps, "disclosure"> {
}
export interface TooltipStore extends TooltipStoreFunctions, Omit<Store<Core.TooltipStore>, "disclosure"> {
}
