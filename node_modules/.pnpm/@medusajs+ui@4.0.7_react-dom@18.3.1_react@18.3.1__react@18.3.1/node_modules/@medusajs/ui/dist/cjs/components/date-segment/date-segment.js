"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateSegment = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const clx_1 = require("../../utils/clx");
const DateSegment = ({ segment, state }) => {
    const ref = React.useRef(null);
    const { segmentProps } = (0, react_aria_1.useDateSegment)(segment, state, ref);
    const isComma = segment.type === "literal" && segment.text === ", ";
    /**
     * We render an empty span with a margin to maintain the correct spacing
     * between date and time segments.
     */
    if (isComma) {
        return React.createElement("span", { className: "mx-1" });
    }
    return (
    /**
     * We wrap the segment in a span to prevent the segment from being
     * focused when the user clicks outside of the component.
     *
     * See: https://github.com/adobe/react-spectrum/issues/3164
     */
    React.createElement("span", null,
        React.createElement("div", { ref: ref, className: (0, clx_1.clx)("transition-fg outline-none", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", {
                "text-ui-fg-muted uppercase": segment.isPlaceholder,
                "text-ui-fg-muted": !segment.isEditable && !state.value,
            }), ...segmentProps }, segment.text)));
};
exports.DateSegment = DateSegment;
//# sourceMappingURL=date-segment.js.map