"use client";
import { clx } from "../../utils/clx";
import * as React from "react";
const ALLOWED_KEYS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
export const DatePickerClearButton = React.forwardRef(({ type = "button", className, children, ...props }, ref) => {
    /**
     * Allows the button to be used with only the keyboard.
     * Otherwise the wrapping component will hijack the event.
     */
    const stopPropagation = (e) => {
        if (!ALLOWED_KEYS.includes(e.key)) {
            e.stopPropagation();
        }
    };
    return (React.createElement("button", { ref: ref, type: type, className: clx("text-ui-fg-muted transition-fg flex size-full items-center justify-center outline-none", "hover:bg-ui-button-transparent-hover", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", className), "aria-label": "Clear date", onKeyDown: stopPropagation, ...props }, children));
});
DatePickerClearButton.displayName = "DatePickerClearButton";
//# sourceMappingURL=date-picker-clear-button.js.map