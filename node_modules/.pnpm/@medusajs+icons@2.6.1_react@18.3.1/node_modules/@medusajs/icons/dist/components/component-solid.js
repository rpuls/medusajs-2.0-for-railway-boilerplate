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
const ComponentSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, fillRule: "evenodd", clipPath: "url(#a)", clipRule: "evenodd" },
            React.createElement("path", { d: "M2.815 4.766a.65.65 0 0 1 .92 0L6.008 7.04a.65.65 0 0 1 0 .92l-2.275 2.275a.65.65 0 0 1-.919 0L.54 7.96a.65.65 0 0 1 0-.92zM7.04.54a.65.65 0 0 1 .92 0l2.274 2.276a.65.65 0 0 1 0 .919L7.96 6.01a.65.65 0 0 1-.919 0L4.765 3.735a.65.65 0 0 1 0-.92zM11.265 4.766a.65.65 0 0 1 .92 0L14.46 7.04a.65.65 0 0 1 0 .92l-2.275 2.275a.65.65 0 0 1-.92 0L8.99 7.96a.65.65 0 0 1 0-.92zM7.04 8.99a.65.65 0 0 1 .92 0l2.274 2.275a.65.65 0 0 1 0 .92L7.96 14.459a.65.65 0 0 1-.919 0l-2.275-2.274a.65.65 0 0 1 0-.92z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ComponentSolid.displayName = "ComponentSolid";
export default ComponentSolid;
