import type { TagStore } from "./tag-store.ts";
export declare const TagValueContext: import("react").Context<string | null>;
export declare const TagRemoveIdContext: import("react").Context<((id?: string) => void) | null>;
/**
 * Returns the tag store from the nearest tag container.
 * @example
 * function Tag() {
 *   const store = useTagContext();
 *
 *   if (!store) {
 *     throw new Error("Tag must be wrapped in TagProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useTagContext: () => TagStore | undefined;
export declare const useTagScopedContext: (onlyScoped?: boolean) => TagStore | undefined;
export declare const useTagProviderContext: () => TagStore | undefined;
export declare const TagContextProvider: (props: import("react").ProviderProps<TagStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const TagScopedContextProvider: (props: import("react").ProviderProps<TagStore | undefined>) => import("react/jsx-runtime").JSX.Element;
