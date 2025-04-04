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
const AtSymbol = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.389 10.167c1.411 0 2.555-1.244 2.555-2.778S8.8 4.61 7.39 4.61 4.833 5.855 4.833 7.39s1.144 2.778 2.556 2.778" }),
            React.createElement("path", { d: "M9.944 4.611v4.607c0 1.382 2.077 1.62 3.175-.248.932-1.58.704-3.99-.46-5.577C10.947 1.058 6.99.185 4.114 2.115 1.472 3.89.531 7.478 1.991 10.378c1.444 2.87 4.835 4.262 7.905 3.223" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
AtSymbol.displayName = "AtSymbol";
export default AtSymbol;
