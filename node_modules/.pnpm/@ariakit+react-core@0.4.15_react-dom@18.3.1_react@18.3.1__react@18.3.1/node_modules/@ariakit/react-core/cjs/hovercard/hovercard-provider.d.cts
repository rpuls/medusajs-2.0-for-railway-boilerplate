import type { ReactNode } from "react";
import type { HovercardStoreProps } from "./hovercard-store.ts";
/**
 * Provides a hovercard store to
 * [Hovercard](https://ariakit.org/components/hovercard) components.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * <HovercardProvider timeout={250}>
 *   <HovercardAnchor />
 *   <Hovercard />
 * </HovercardProvider>
 * ```
 */
export declare function HovercardProvider(props?: HovercardProviderProps): import("react/jsx-runtime").JSX.Element;
export interface HovercardProviderProps extends HovercardStoreProps {
    children?: ReactNode;
}
