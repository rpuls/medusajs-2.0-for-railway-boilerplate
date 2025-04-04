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
const Spinner = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.667 1.056v2.222" }),
            React.createElement("path", { d: "m12.224 2.943-1.572 1.571", opacity: 0.88 }),
            React.createElement("path", { d: "M14.111 7.5H11.89", opacity: 0.75 }),
            React.createElement("path", { d: "m12.224 12.057-1.572-1.571", opacity: 0.63 }),
            React.createElement("path", { d: "M7.667 13.945v-2.223", opacity: 0.5 }),
            React.createElement("path", { d: "m3.11 12.057 1.57-1.571", opacity: 0.38 }),
            React.createElement("path", { d: "M1.222 7.5h2.222", opacity: 0.25 }),
            React.createElement("path", { d: "m3.11 2.943 1.57 1.571", opacity: 0.13 })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Spinner.displayName = "Spinner";
export default Spinner;
