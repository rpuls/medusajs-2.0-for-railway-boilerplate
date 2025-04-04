import type { ElementType } from "react";
import type { HeadingOptions } from "../heading/heading.tsx";
import type { Props } from "../utils/types.ts";
import type { DialogStore } from "./dialog-store.ts";
declare const TagName = "h1";
type TagName = typeof TagName;
/**
 * Returns props to create a `DialogHeading` component. This hook must be used
 * in a component that's wrapped with `Dialog` so the `aria-labelledby` prop is
 * properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * // This component must be wrapped with Dialog
 * const props = useDialogHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export declare const useDialogHeading: import("../utils/types.ts").Hook<"h1", DialogHeadingOptions<"h1">>;
/**
 * Renders a heading in a dialog. This component must be wrapped with
 * [`Dialog`](https://ariakit.org/reference/dialog) so the `aria-labelledby`
 * prop is properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {4}
 * const [open, setOpen] = useState(false);
 *
 * <Dialog open={open} onClose={() => setOpen(false)}>
 *   <DialogHeading>Heading</DialogHeading>
 * </Dialog>
 * ```
 */
export declare const DialogHeading: (props: DialogHeadingProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface DialogHeadingOptions<T extends ElementType = TagName> extends HeadingOptions<T> {
    /**
     * Object returned by the
     * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
     * not provided, the closest [`Dialog`](https://ariakit.org/reference/dialog)
     * component's context will be used.
     */
    store?: DialogStore;
}
export type DialogHeadingProps<T extends ElementType = TagName> = Props<T, DialogHeadingOptions<T>>;
export {};
