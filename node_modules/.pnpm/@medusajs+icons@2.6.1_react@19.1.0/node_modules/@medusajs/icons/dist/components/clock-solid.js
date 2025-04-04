var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
const ClockSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M14.167 3.278a.66.66 0 0 1-.472-.196l-1.777-1.778a.667.667 0 0 1 .943-.943l1.778 1.778a.667.667 0 0 1-.472 1.139M.833 3.278a.667.667 0 0 1-.471-1.139L2.14.362a.667.667 0 1 1 .943.943L1.305 3.083c-.13.13-.3.196-.47.196zM12.342 11.399a6.2 6.2 0 0 0 1.38-3.899A6.23 6.23 0 0 0 7.5 1.278 6.23 6.23 0 0 0 1.278 7.5a6.2 6.2 0 0 0 1.38 3.899l-1.185 1.185a.667.667 0 0 0 .943.943L3.6 12.342a6.2 6.2 0 0 0 3.899 1.38 6.2 6.2 0 0 0 3.9-1.38l1.185 1.185a.665.665 0 0 0 .942 0 .667.667 0 0 0 0-.943zm-1.835-1.986a.665.665 0 0 1-.92.204L7.143 8.062a.67.67 0 0 1-.309-.563V4.61a.667.667 0 0 1 1.334 0v2.523l2.136 1.36c.31.197.4.609.203.92" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ClockSolid.displayName = "ClockSolid";
export default ClockSolid;
