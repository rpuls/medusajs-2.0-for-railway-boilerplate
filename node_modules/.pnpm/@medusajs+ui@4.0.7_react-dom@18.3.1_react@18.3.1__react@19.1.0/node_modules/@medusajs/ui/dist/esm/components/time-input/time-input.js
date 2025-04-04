"use client";
import * as React from "react";
import { useLocale, useTimeField, } from "react-aria";
import { useTimeFieldState } from "react-stately";
import { DateSegment } from "../date-segment";
import { clx } from "../../utils/clx";
const TimeInput = (props) => {
    const ref = React.useRef(null);
    const { locale } = useLocale();
    const state = useTimeFieldState({
        ...props,
        locale,
    });
    const { fieldProps } = useTimeField(props, state, ref);
    return (React.createElement("div", { ref: ref, ...fieldProps, "aria-label": "Time input", className: clx("bg-ui-bg-field shadow-borders-base txt-compact-small flex items-center rounded-md px-2 py-1", {
            "": props.isDisabled,
        }) }, state.segments.map((segment, index) => {
        return React.createElement(DateSegment, { key: index, segment: segment, state: state });
    })));
};
export { TimeInput };
//# sourceMappingURL=time-input.js.map