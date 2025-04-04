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
const CloudArrowDown = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M10.167 10h.444c1.841 0 3.333-1.314 3.333-2.935 0-1.358-1.053-2.49-2.476-2.824C11.303 2.43 9.6 1 7.5 1c-2.209 0-4 1.577-4 3.522 0 .274.044.537.11.793-1.42.052-2.554 1.075-2.554 2.337C1.056 8.95 2.249 10 3.722 10h1.111M9.5 12.11l-2 2-2-2M7.5 14.11V6.554" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
CloudArrowDown.displayName = "CloudArrowDown";
export default CloudArrowDown;
