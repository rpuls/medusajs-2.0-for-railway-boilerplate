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
const InformationCircle = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m6.829 6.784.037-.018a.671.671 0 0 1 .95.763l-.633 2.537a.67.67 0 0 0 .951.763l.037-.018M7.5 4.1h.007v.007H7.5z" }),
            React.createElement("circle", { cx: 7.5, cy: 7.5, r: 6.36 })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
InformationCircle.displayName = "InformationCircle";
export default InformationCircle;
