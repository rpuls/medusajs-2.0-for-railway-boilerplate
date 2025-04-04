import type { SetState } from "@ariakit/core/utils/types";
import type { DialogStore } from "./dialog-store.ts";
/**
 * Returns the dialog store from the nearest dialog container.
 * @example
 * function Dialog() {
 *   const store = useDialogContext();
 *
 *   if (!store) {
 *     throw new Error("Dialog must be wrapped in DialogProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useDialogContext: () => DialogStore | undefined;
export declare const useDialogScopedContext: (onlyScoped?: boolean) => DialogStore | undefined;
export declare const useDialogProviderContext: () => DialogStore | undefined;
export declare const DialogContextProvider: (props: import("react").ProviderProps<DialogStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const DialogScopedContextProvider: (props: import("react").ProviderProps<DialogStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const DialogHeadingContext: import("react").Context<SetState<string | undefined> | undefined>;
export declare const DialogDescriptionContext: import("react").Context<SetState<string | undefined> | undefined>;
