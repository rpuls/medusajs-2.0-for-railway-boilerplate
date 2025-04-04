"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePickerClearButton = void 0;
const tslib_1 = require("tslib");
const clx_1 = require("../../utils/clx");
const React = tslib_1.__importStar(require("react"));
const ALLOWED_KEYS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
exports.DatePickerClearButton = React.forwardRef(({ type = "button", className, children, ...props }, ref) => {
    /**
     * Allows the button to be used with only the keyboard.
     * Otherwise the wrapping component will hijack the event.
     */
    const stopPropagation = (e) => {
        if (!ALLOWED_KEYS.includes(e.key)) {
            e.stopPropagation();
        }
    };
    return (React.createElement("button", { ref: ref, type: type, className: (0, clx_1.clx)("text-ui-fg-muted transition-fg flex size-full items-center justify-center outline-none", "hover:bg-ui-button-transparent-hover", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", className), "aria-label": "Clear date", onKeyDown: stopPropagation, ...props }, children));
});
exports.DatePickerClearButton.displayName = "DatePickerClearButton";
//# sourceMappingURL=date-picker-clear-button.js.map