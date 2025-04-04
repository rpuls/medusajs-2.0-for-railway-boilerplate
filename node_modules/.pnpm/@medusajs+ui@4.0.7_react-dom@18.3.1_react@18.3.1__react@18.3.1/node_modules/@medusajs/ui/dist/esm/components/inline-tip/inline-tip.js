import { clx } from "../../utils/clx";
import * as React from "react";
/**
 * This component is based on the `div` element and supports all of its props.
 */
export const InlineTip = React.forwardRef(({ 
/**
 * The variant of the tip.
 */
variant = "info", 
/**
 * The label to display in the tip.
 */
label, className, children, ...props }, ref) => {
    return (React.createElement("div", { ref: ref, className: clx("bg-ui-bg-component txt-small text-ui-fg-subtle grid grid-cols-[4px_1fr] items-start gap-3 rounded-lg border p-3", className), ...props },
        React.createElement("div", { role: "presentation", className: clx("bg-ui-tag-neutral-icon h-full w-1 rounded-full", {
                "bg-ui-tag-orange-icon": variant === "warning",
                "bg-ui-tag-red-icon": variant === "error",
                "bg-ui-tag-green-icon": variant === "success",
            }) }),
        React.createElement("div", { className: "text-pretty" },
            React.createElement("strong", { className: "txt-small-plus text-ui-fg-base" },
                label,
                ":"),
            " ",
            children)));
});
InlineTip.displayName = "InlineTip";
//# sourceMappingURL=inline-tip.js.map