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
const BookOpen = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.5 12.96a.9.9 0 0 0 .44-.118 5.6 5.6 0 0 1 2.791-.751 5.5 5.5 0 0 1 2.018.386c.576.227 1.194-.213 1.194-.833V3.571a.88.88 0 0 0-.431-.765 5.5 5.5 0 0 0-2.792-.767c-1.68 0-2.842.775-3.22 1.05" }),
            React.createElement("path", { d: "M7.5 12.96a.9.9 0 0 1-.44-.118 5.6 5.6 0 0 0-2.791-.751 5.5 5.5 0 0 0-2.018.386c-.576.227-1.195-.21-1.195-.829v-8.08c0-.315.161-.6.432-.76A5.5 5.5 0 0 1 4.28 2.04c1.68 0 2.842.775 3.22 1.05z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
BookOpen.displayName = "BookOpen";
export default BookOpen;
