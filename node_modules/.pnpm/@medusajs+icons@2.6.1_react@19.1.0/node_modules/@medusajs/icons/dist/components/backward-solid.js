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
const BackwardSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { fill: color, d: "M14.255 3.285a1 1 0 0 0-1-.014l-4.95 2.743V4.152a1 1 0 0 0-.495-.867 1 1 0 0 0-.999-.013L.77 6.619a1.008 1.008 0 0 0 0 1.762l6.041 3.347a1 1 0 0 0 1-.012 1 1 0 0 0 .495-.868V8.986l4.95 2.742a1 1 0 0 0 .999-.012 1 1 0 0 0 .495-.868V4.152a1 1 0 0 0-.495-.867" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
BackwardSolid.displayName = "BackwardSolid";
export default BackwardSolid;
