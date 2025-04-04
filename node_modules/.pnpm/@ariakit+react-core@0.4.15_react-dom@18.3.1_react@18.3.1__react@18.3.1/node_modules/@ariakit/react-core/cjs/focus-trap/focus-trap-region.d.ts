import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `FocusTrapRegion` component.
 * @see https://ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * const props = useFocusTrapRegion();
 * <Role {...props} />
 * ```
 */
export declare const useFocusTrapRegion: import("../utils/types.ts").Hook<"div", FocusTrapRegionOptions<"div">>;
/**
 * Renders a wrapper element that traps the focus inside it when the
 * [`enabled`](https://ariakit.org/reference/focus-trap-region#enabled) prop is
 * `true`.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * <FocusTrapRegion>
 *  <Button>click me</Button>
 *  <Button>trap focus</Button>
 *  <Button disabled>disabled Button</Button>
 * </FocusTrapRegion>
 * ```
 */
export declare const FocusTrapRegion: (props: FocusTrapRegionProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FocusTrapRegionOptions<_T extends ElementType = TagName> extends Options {
    /**
     * If true, it will trap the focus in the region.
     * @default false
     */
    enabled?: boolean;
}
export type FocusTrapRegionProps<T extends ElementType = TagName> = Props<T, FocusTrapRegionOptions<T>>;
export {};
