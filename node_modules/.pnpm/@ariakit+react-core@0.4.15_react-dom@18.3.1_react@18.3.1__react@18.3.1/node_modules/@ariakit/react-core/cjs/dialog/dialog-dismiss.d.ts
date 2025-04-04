import type { ElementType } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import type { Props } from "../utils/types.ts";
import type { DialogStore } from "./dialog-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `DialogDismiss` component.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const store = useDialogStore();
 * const props = useDialogDismiss({ store });
 * <Dialog store={store}>
 *   <Role {...props} />
 * </Dialog>
 * ```
 */
export declare const useDialogDismiss: import("../utils/types.ts").Hook<"button", DialogDismissOptions<"button">>;
/**
 * Renders a button that hides a
 * [`Dialog`](https://ariakit.org/reference/dialog) when clicked.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {4}
 * const [open, setOpen] = useState(false);
 *
 * <Dialog open={open} onClose={() => setOpen(false)}>
 *   <DialogDismiss />
 * </Dialog>
 * ```
 */
export declare const DialogDismiss: (props: DialogDismissProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface DialogDismissOptions<T extends ElementType = TagName> extends ButtonOptions<T> {
    /**
     * Object returned by the
     * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
     * not provided, the closest [`Dialog`](https://ariakit.org/reference/dialog)
     * component's context will be used.
     */
    store?: DialogStore;
}
export type DialogDismissProps<T extends ElementType = TagName> = Props<T, DialogDismissOptions<T>>;
export {};
