import type { ReactNode } from "react";
import type { HeadingLevels } from "./utils.ts";
/**
 * A component that sets the heading level for its children. It doesn't render
 * any HTML element, just sets the
 * [`level`](https://ariakit.org/reference/heading-level#level) prop on the
 * context.
 * @see https://ariakit.org/components/heading
 * @example
 * ```jsx
 * <HeadingLevel>
 *   <Heading>Heading 1</Heading>
 *   <HeadingLevel>
 *     <Heading>Heading 2</Heading>
 *   </HeadingLevel>
 * </HeadingLevel>
 * ```
 */
export declare function HeadingLevel({ level, children }: HeadingLevelProps): import("react/jsx-runtime").JSX.Element;
export interface HeadingLevelProps {
    /**
     * The heading level. By default, it'll increase the level by 1 based on the
     * context.
     */
    level?: HeadingLevels;
    children?: ReactNode;
}
