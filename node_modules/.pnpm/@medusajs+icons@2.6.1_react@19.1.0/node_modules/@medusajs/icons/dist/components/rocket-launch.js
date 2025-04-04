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
const RocketLaunch = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11.265 8.386c3.118-3.271 2.736-7.084 2.704-7.355C13.697 1 9.885.617 6.614 3.735a10.4 10.4 0 0 0-2.842 4.702l2.79 2.79c.706-.193 2.815-.86 4.703-2.841" }),
            React.createElement("path", { fill: color, d: "M9.743 6.75a1.493 1.493 0 1 0 0-2.985 1.493 1.493 0 0 0 0 2.985" }),
            React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4.5 12.48c-.234.519-.757.88-1.363.88H1.64v-1.496c0-.606.36-1.13.88-1.364M11.211 8.442l.21 1.175a2.8 2.8 0 0 1-1.138 2.779L8.02 14s.548-1.434.238-3.416M6.558 3.789l-1.172-.21a2.8 2.8 0 0 0-2.784 1.14L1 6.98s1.434-.548 3.416-.238" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
RocketLaunch.displayName = "RocketLaunch";
export default RocketLaunch;
