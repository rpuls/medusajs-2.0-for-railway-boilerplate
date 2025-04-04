import type { ReactNode } from "react";
import type { DisclosureStoreProps } from "./disclosure-store.ts";
/**
 * Provides a disclosure store to
 * [Disclosure](https://ariakit.org/components/disclosure) components.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * <DisclosureProvider>
 *   <Disclosure />
 *   <DisclosureContent />
 * </DisclosureProvider>
 * ```
 */
export declare function DisclosureProvider(props?: DisclosureProviderProps): import("react/jsx-runtime").JSX.Element;
export interface DisclosureProviderProps extends DisclosureStoreProps {
    children?: ReactNode;
}
