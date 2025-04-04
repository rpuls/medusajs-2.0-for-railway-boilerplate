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
const ComputerDesktop = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.333, clipPath: "url(#a)" },
            React.createElement("path", { d: "M4.611 13.944a9.6 9.6 0 0 1 5.778 0M7.5 11.278V13.5M12.167 1.944H2.833c-.982 0-1.777.796-1.777 1.778V9.5c0 .982.795 1.778 1.777 1.778h9.334c.982 0 1.777-.796 1.777-1.778V3.722c0-.982-.796-1.778-1.777-1.778" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ComputerDesktop.displayName = "ComputerDesktop";
export default ComputerDesktop;
