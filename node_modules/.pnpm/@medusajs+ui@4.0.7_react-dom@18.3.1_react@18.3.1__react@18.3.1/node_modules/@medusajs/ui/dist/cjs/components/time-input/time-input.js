"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeInput = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const react_stately_1 = require("react-stately");
const date_segment_1 = require("../date-segment");
const clx_1 = require("../../utils/clx");
const TimeInput = (props) => {
    const ref = React.useRef(null);
    const { locale } = (0, react_aria_1.useLocale)();
    const state = (0, react_stately_1.useTimeFieldState)({
        ...props,
        locale,
    });
    const { fieldProps } = (0, react_aria_1.useTimeField)(props, state, ref);
    return (React.createElement("div", { ref: ref, ...fieldProps, "aria-label": "Time input", className: (0, clx_1.clx)("bg-ui-bg-field shadow-borders-base txt-compact-small flex items-center rounded-md px-2 py-1", {
            "": props.isDisabled,
        }) }, state.segments.map((segment, index) => {
        return React.createElement(date_segment_1.DateSegment, { key: index, segment: segment, state: state });
    })));
};
exports.TimeInput = TimeInput;
//# sourceMappingURL=time-input.js.map