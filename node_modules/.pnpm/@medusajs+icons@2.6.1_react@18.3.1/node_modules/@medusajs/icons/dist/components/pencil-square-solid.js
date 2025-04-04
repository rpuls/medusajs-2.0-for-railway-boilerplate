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
const PencilSquareSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M6.833 2.611H1.056a.667.667 0 0 1 0-1.333h5.777a.667.667 0 0 1 0 1.333M3.278 5.722H1.056a.667.667 0 0 1 0-1.333h2.222a.667.667 0 0 1 0 1.333M10.535 2.032 3.593 8.973c-.767.768-1.245 3.028-1.416 3.964a.668.668 0 0 0 .775.776c.936-.17 3.196-.648 3.964-1.416l6.941-6.942a2.353 2.353 0 0 0 0-3.322c-.887-.888-2.434-.888-3.322-.001" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
PencilSquareSolid.displayName = "PencilSquareSolid";
export default PencilSquareSolid;
