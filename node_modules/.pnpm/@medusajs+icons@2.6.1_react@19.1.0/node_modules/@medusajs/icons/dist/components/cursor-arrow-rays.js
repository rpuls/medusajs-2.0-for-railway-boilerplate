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
const CursorArrowRays = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "m6.696 6.414 6.5 2.23c.198.068.202.346.007.419l-2.915 1.096a.22.22 0 0 0-.13.13l-1.095 2.914a.222.222 0 0 1-.418-.006L6.414 6.696a.223.223 0 0 1 .282-.283zM10.194 10.194l3.744 3.744M6.389 1.056v1.777M10.16 2.617 8.904 3.875M2.617 10.16l1.258-1.257M1.056 6.389h1.777M2.617 2.617l1.258 1.258" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
CursorArrowRays.displayName = "CursorArrowRays";
export default CursorArrowRays;
