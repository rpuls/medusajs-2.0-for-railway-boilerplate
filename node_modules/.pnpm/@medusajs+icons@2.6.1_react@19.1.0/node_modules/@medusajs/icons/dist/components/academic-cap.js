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
const AcademicCap = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "m7.907 1.599 5.629 2.897a.754.754 0 0 1 0 1.34L7.907 8.736a.89.89 0 0 1-.814 0L1.464 5.837a.754.754 0 0 1 0-1.34l5.629-2.898a.89.89 0 0 1 .814 0" }),
            React.createElement("path", { d: "M13.944 5.167a9.94 9.94 0 0 0 0 4.472M3.278 9.056v2.889c0 .98 1.89 1.777 4.222 1.777s4.222-.796 4.222-1.777v-2.89" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
AcademicCap.displayName = "AcademicCap";
export default AcademicCap;
