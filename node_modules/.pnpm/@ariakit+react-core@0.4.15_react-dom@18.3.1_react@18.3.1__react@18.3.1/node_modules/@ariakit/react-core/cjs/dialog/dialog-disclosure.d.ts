import type { ElementType } from "react";
import type { DisclosureOptions } from "../disclosure/disclosure.tsx";
import type { Props } from "../utils/types.ts";
import type { DialogStore } from "./dialog-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `DialogDisclosure` component.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const store = useDialogStore();
 * const props = useDialogDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <Dialog store={store}>Content</Dialog>
 * ```
 */
export declare const useDialogDisclosure: import("../utils/types.ts").Hook<"button", DialogDisclosureOptions<"button">>;
/**
 * Renders a button that toggles the visibility of a
 * [`Dialog`](https://ariakit.org/reference/dialog) component when clicked.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {2}
 * <DialogProvider>
 *   <DialogDisclosure>Disclosure</DialogDisclosure>
 *   <Dialog>Content</Dialog>
 * </DialogProvider>
 * ```
 */
export declare const DialogDisclosure: (props: DialogDisclosureProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface DialogDisclosureOptions<T extends ElementType = TagName> extends DisclosureOptions<T> {
    /**
     * Object returned by the
     * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
     * not provided, the closest
     * [`DialogProvider`](https://ariakit.org/reference/dialog-provider)
     * component's context will be used.
     */
    store?: DialogStore;
}
export type DialogDisclosureProps<T extends ElementType = TagName> = Props<T, DialogDisclosureOptions<T>>;
export {};
