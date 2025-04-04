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
const FlagMini = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#b)" },
                React.createElement("path", { d: "M2.833 2.38c1.032-.718 2.006-1.015 2.917-.875 1.502.23 1.995 1.52 3.5 1.75.9.138 1.872-.148 2.917-.874v5.834c-1.045.727-2.016 1.013-2.917.874-1.504-.23-1.998-1.52-3.5-1.75-.912-.14-1.885.157-2.917.875M2.833 1.278v12.444" }))),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })),
            React.createElement("clipPath", { id: "b" },
                React.createElement("path", { fill: "#fff", d: "M-.5-.5h16v16h-16z" })))));
});
FlagMini.displayName = "FlagMini";
export default FlagMini;
