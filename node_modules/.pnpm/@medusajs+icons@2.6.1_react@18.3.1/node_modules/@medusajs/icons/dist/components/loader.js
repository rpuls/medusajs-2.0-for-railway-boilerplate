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
const Loader = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.5 1.056v2.222" }),
            React.createElement("path", { d: "m12.057 2.943-1.571 1.571", opacity: 0.88 }),
            React.createElement("path", { d: "M13.944 7.5h-2.222", opacity: 0.75 }),
            React.createElement("path", { d: "m12.057 12.057-1.571-1.571", opacity: 0.63 }),
            React.createElement("path", { d: "M7.5 13.945v-2.223", opacity: 0.5 }),
            React.createElement("path", { d: "m2.943 12.057 1.571-1.571", opacity: 0.38 }),
            React.createElement("path", { d: "M1.056 7.5h2.222", opacity: 0.25 }),
            React.createElement("path", { d: "m2.943 2.943 1.571 1.571", opacity: 0.13 })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Loader.displayName = "Loader";
export default Loader;
