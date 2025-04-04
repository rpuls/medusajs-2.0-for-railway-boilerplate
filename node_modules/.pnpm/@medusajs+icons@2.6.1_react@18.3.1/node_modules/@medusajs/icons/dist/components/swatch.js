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
const Swatch = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M1.793 13.207A2.7 2.7 0 0 0 3.708 14m-1.915-.793A2.7 2.7 0 0 0 3.708 14m-1.915-.793A2.7 2.7 0 0 1 1 11.29V1.812C1 1.364 1.364 1 1.813 1h3.791c.449 0 .813.364.813.812v2.941M3.708 14a2.7 2.7 0 0 0 1.916-.793M3.708 14a2.7 2.7 0 0 0 1.916-.793M3.708 14h9.48a.813.813 0 0 0 .812-.813V9.396a.813.813 0 0 0-.812-.813h-2.941m-4.623 4.624 4.623-4.624m-4.623 4.624a2.7 2.7 0 0 0 .793-1.916V4.753m3.83 3.83 2.079-2.08a.81.81 0 0 0 0-1.148L9.645 2.673a.81.81 0 0 0-1.148 0l-2.08 2.08m-2.709 6.538h.006v.006h-.006z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Swatch.displayName = "Swatch";
export default Swatch;
