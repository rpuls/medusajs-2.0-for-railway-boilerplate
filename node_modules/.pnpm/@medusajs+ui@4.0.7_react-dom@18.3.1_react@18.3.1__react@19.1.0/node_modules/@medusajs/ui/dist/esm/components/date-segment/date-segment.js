"use client";
import * as React from "react";
import { useDateSegment } from "react-aria";
import { clx } from "../../utils/clx";
const DateSegment = ({ segment, state }) => {
    const ref = React.useRef(null);
    const { segmentProps } = useDateSegment(segment, state, ref);
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
        React.createElement("div", { ref: ref, className: clx("transition-fg outline-none", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", {
                "text-ui-fg-muted uppercase": segment.isPlaceholder,
                "text-ui-fg-muted": !segment.isEditable && !state.value,
            }), ...segmentProps }, segment.text)));
};
export { DateSegment };
//# sourceMappingURL=date-segment.js.map