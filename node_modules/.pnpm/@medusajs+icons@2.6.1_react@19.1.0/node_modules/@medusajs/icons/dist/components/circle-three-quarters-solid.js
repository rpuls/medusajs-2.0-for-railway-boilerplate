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
const CircleThreeQuartersSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { fillRule: "evenodd", d: "M7.5 13.277a5.777 5.777 0 1 0 0-11.554 5.777 5.777 0 0 0 0 11.554m0 1.333A7.11 7.11 0 1 0 7.5.39a7.11 7.11 0 0 0 0 14.22", clipRule: "evenodd" }),
            React.createElement("path", { d: "M7.5 11.944a4.444 4.444 0 1 0 0-8.888V7.5H3.056c0 2.434 2.053 4.444 4.444 4.444" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
CircleThreeQuartersSolid.displayName = "CircleThreeQuartersSolid";
export default CircleThreeQuartersSolid;
