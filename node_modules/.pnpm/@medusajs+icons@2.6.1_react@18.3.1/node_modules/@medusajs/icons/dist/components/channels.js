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
const Channels = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.722 7.5h-3.11M10.389 3.722H9.5c-.982 0-1.778.796-1.778 1.778v4c0 .982.796 1.778 1.778 1.778h.889" }),
            React.createElement("path", { d: "M10.389 3.722a1.778 1.778 0 1 0 3.555 0 1.778 1.778 0 0 0-3.555 0M10.389 11.278a1.778 1.778 0 1 0 3.556 0 1.778 1.778 0 0 0-3.556 0M1.056 7.5a1.778 1.778 0 1 0 3.555 0 1.778 1.778 0 0 0-3.555 0" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Channels.displayName = "Channels";
export default Channels;
