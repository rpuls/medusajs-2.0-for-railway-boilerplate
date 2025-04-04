import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { DialogStore } from "./dialog-store.ts";
declare const TagName = "p";
type TagName = typeof TagName;
/**
 * Returns props to create a `DialogDescription` component. This hook must be
 * used in a component that's wrapped with `Dialog` so the `aria-describedby`
 * prop is properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * // This component must be wrapped with Dialog
 * const props = useDialogDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export declare const useDialogDescription: import("../utils/types.ts").Hook<"p", DialogDescriptionOptions<"p">>;
/**
 * Renders a description in a dialog. This component must be wrapped with
 * [`Dialog`](https://ariakit.org/reference/dialog) so the `aria-describedby`
 * prop is properly set on the dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {4}
 * const [open, setOpen] = useState(false);
 *
 * <Dialog open={open} onClose={() => setOpen(false)}>
 *   <DialogDescription>Description</DialogDescription>
 * </Dialog>
 * ```
 */
export declare const DialogDescription: (props: DialogDescriptionProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface DialogDescriptionOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
     * not provided, the closest [`Dialog`](https://ariakit.org/reference/dialog)
     * component's context will be used.
     */
    store?: DialogStore;
}
export type DialogDescriptionProps<T extends ElementType = TagName> = Props<T, DialogDescriptionOptions<T>>;
export {};
