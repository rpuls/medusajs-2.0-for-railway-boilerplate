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
const Glasses = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M6.389 9.5a1.112 1.112 0 0 1 2.222 0M1.134 8.857l1.01-5.492A1.778 1.778 0 0 1 4.68 2.133M13.866 8.857l-1.01-5.492a1.778 1.778 0 0 0-2.536-1.232" }),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3.722 12.167a2.667 2.667 0 1 0 0-5.334 2.667 2.667 0 0 0 0 5.334M11.278 12.167a2.667 2.667 0 1 0 0-5.333 2.667 2.667 0 0 0 0 5.333" })));
});
Glasses.displayName = "Glasses";
export default Glasses;
