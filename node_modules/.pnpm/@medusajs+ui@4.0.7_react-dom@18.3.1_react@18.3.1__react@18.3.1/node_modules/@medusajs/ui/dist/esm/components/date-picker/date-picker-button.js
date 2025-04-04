"use client";
import { clx } from "../../utils/clx";
import * as React from "react";
import { useButton } from "react-aria";
const DatePickerButton = React.forwardRef(({ children, size = "base", ...props }, ref) => {
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const { buttonProps } = useButton(props, innerRef);
    return (React.createElement("button", { type: "button", className: clx("text-ui-fg-muted transition-fg flex items-center justify-center border-r outline-none", "disabled:text-ui-fg-disabled", "hover:bg-ui-button-transparent-hover", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", {
            "size-7": size === "small",
            "size-8": size === "base",
        }), "aria-label": "Open calendar", ...buttonProps }, children));
});
DatePickerButton.displayName = "DatePickerButton";
export { DatePickerButton };
//# sourceMappingURL=date-picker-button.js.map