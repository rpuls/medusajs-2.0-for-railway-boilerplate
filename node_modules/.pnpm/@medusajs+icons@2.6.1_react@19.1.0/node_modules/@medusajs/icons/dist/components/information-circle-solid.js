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
const InformationCircleSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { fill: color, fillRule: "evenodd", d: "M14.61 7.5a7.11 7.11 0 1 1-14.22 0 7.11 7.11 0 0 1 14.22 0M8.389 3.945a.889.889 0 1 1-1.778 0 .889.889 0 0 1 1.778 0M6.61 6.611a.667.667 0 1 0 0 1.333h.225a.222.222 0 0 1 .217.27l-.408 1.837a1.555 1.555 0 0 0 1.519 1.893h.225a.667.667 0 0 0 0-1.333h-.225a.222.222 0 0 1-.217-.27l.408-1.837a1.555 1.555 0 0 0-1.519-1.893z", clipRule: "evenodd" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
InformationCircleSolid.displayName = "InformationCircleSolid";
export default InformationCircleSolid;
