import * as Core from "@ariakit/core/dialog/dialog-store";
import type { DisclosureStoreFunctions, DisclosureStoreOptions, DisclosureStoreState } from "../disclosure/disclosure-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useDialogStoreProps<T extends Core.DialogStore>(store: T, update: () => void, props: DialogStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
};
/**
 * Creates a dialog store to control the state of
 * [Dialog](https://ariakit.org/components/dialog) components.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
 *
 * <button onClick={dialog.toggle}>Open dialog</button>
 * <Dialog store={dialog}>Content</Dialog>
 * ```
 */
export declare function useDialogStore(props?: DialogStoreProps): DialogStore;
export interface DialogStoreState extends Core.DialogStoreState, DisclosureStoreState {
}
export interface DialogStoreFunctions extends Omit<Core.DialogStoreFunctions, "disclosure">, DisclosureStoreFunctions {
}
export interface DialogStoreOptions extends Omit<Core.DialogStoreOptions, "disclosure">, DisclosureStoreOptions {
}
export interface DialogStoreProps extends DialogStoreOptions, Omit<Core.DialogStoreProps, "disclosure"> {
}
export interface DialogStore extends DialogStoreFunctions, Omit<Store<Core.DialogStore>, "disclosure"> {
}
