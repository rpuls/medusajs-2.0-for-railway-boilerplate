import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ChangeEvent, ClipboardEvent, ElementType, KeyboardEvent, SyntheticEvent } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import type { Props } from "../utils/types.ts";
import type { TagStore } from "./tag-store.ts";
declare const TagName = "input";
type TagName = typeof TagName;
type EventWithValues<T extends SyntheticEvent> = T & {
    values: string[];
};
/**
 * Returns props to create a `TagInput` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTagInput();
 * <Role.input {...props} />
 * ```
 */
export declare const useTagInput: import("../utils/types.ts").Hook<"input", TagInputOptions<"input">>;
/**
 * Renders an input element within a
 * [`TagList`](https://ariakit.org/reference/tag-list) component. This component
 * lets users input tag values that are added to the store when the input value
 * changes or when the user pastes text into the input element, based on the
 * [`delimiter`](https://ariakit.org/reference/tag-input#delimiter) prop.
 *
 * This component can be combined with a
 * [`Combobox`](https://ariakit.org/reference/combobox) component using the
 * [`render`](https://ariakit.org/reference/tag-input#render) prop to create a
 * tag input with suggestions.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {14}
 * <TagProvider>
 *   <TagListLabel>Invitees</TagListLabel>
 *   <TagList>
 *     <TagValues>
 *       {(values) =>
 *         values.map((value) => (
 *           <Tag key={value} value={value}>
 *             {value}
 *             <TagRemove />
 *           </Tag>
 *         ))
 *       }
 *     </TagValues>
 *     <TagInput />
 *   </TagList>
 * </TagProvider>
 * ```
 */
export declare const TagInput: (props: TagInputProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TagInputOptions<T extends ElementType = TagName> extends CompositeItemOptions<T> {
    /**
     * Object returned by the
     * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
     * provided, the closest
     * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
     * context will be used.
     */
    store?: TagStore;
    /**
     * The string or pattern employed to break the input value into multiple tags.
     * This could be a string, a regular expression, an array of strings and
     * regular expressions, or `null` to prevent splitting on input.
     *
     * When an array is given, the input value is split by the first matching
     * delimiter. All other delimiters are disregarded for the same input event.
     * For example, if the delimiters are `["\n", ","]` and the user pastes text
     * containing commas and newlines, the text will be split solely by newlines.
     * The commas will be preserved in the tag values. If you want to split by
     * both commas and newlines, you should use a regular expression that matches
     * both characters (e.g., `/[\n,]/`).
     * @default ["\n", ";", ",", /\s/]
     */
    delimiter?: string | RegExp | null | (string | RegExp)[];
    /**
     * Determines if tag values should be added to the store when the input value
     * is pasted. The values are extracted from the clipboard text and
     * automatically processed with the
     * [`delimiter`](https://ariakit.org/reference/tag-input#delimiter) prop.
     *
     * This can be either a boolean or a callback that receives an event with an
     * extra `values` property and should return a boolean.
     * @default true
     */
    addValueOnPaste?: BooleanOrCallback<EventWithValues<ClipboardEvent<HTMLElement>>>;
    /**
     * Determines if the tag value should be added to the store when the input
     * value changes. The tag value is automatically processed with the
     * [`delimiter`](https://ariakit.org/reference/tag-input#delimiter) prop.
     *
     * This can be either a boolean or a callback that receives an event with an
     * extra `values` property and should return a boolean.
     * @default true
     */
    addValueOnChange?: BooleanOrCallback<EventWithValues<ChangeEvent<HTMLElement>>>;
    /**
     * Whether the tag
     * [`value`](https://ariakit.org/reference/tag-provider#value) state
     * should be updated when the input value changes. This is useful if you want
     * to customize how the store
     * [`value`](https://ariakit.org/reference/tag-provider#value) is updated
     * based on the input element's value.
     * @default true
     */
    setValueOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
    /**
     * Determines whether the last tag value should be removed from the store when
     * the `Backspace` key is pressed and the cursor is at the start of the input
     * value.
     * @default true
     */
    removeOnBackspace?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
    /**
     * @default true
     */
    tabbable?: CompositeItemOptions<T>["tabbable"];
}
export type TagInputProps<T extends ElementType = TagName> = Props<T, TagInputOptions<T>>;
export {};
