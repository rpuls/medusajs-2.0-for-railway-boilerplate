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
const ArrowUpTray = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M13.056 9.944v1.334c0 .982-.796 1.777-1.778 1.777H3.722a1.777 1.777 0 0 1-1.778-1.777V9.944M10.611 5.055 7.5 1.945l-3.111 3.11M7.5 1.944v6.667" })));
});
ArrowUpTray.displayName = "ArrowUpTray";
export default ArrowUpTray;
