"use client";
import { cva } from "cva";
import { Label as RadixLabel } from "radix-ui";
import * as React from "react";
import { clx } from "../../utils/clx";
const labelVariants = cva({
    base: "font-sans",
    variants: {
        size: {
            xsmall: "txt-compact-xsmall",
            small: "txt-compact-small",
            base: "txt-compact-medium",
            large: "txt-compact-large",
        },
        weight: {
            regular: "font-normal",
            plus: "font-medium",
        },
    },
    defaultVariants: {
        size: "base",
        weight: "regular",
    },
});
/**
 * This component is based on the [Radix UI Label](https://www.radix-ui.com/primitives/docs/components/label) primitive.
 */
const Label = React.forwardRef(({ className, 
/**
 * The label's size.
 */
size = "base", 
/**
 * The label's font weight.
 */
weight = "regular", ...props }, ref) => {
    return (React.createElement(RadixLabel.Root, { ref: ref, className: clx(labelVariants({ size, weight }), className), ...props }));
});
Label.displayName = "Label";
export { Label };
//# sourceMappingURL=label.js.map