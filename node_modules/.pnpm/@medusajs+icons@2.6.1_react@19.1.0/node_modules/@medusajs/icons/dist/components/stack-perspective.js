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
const StackPerspective = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "m2.389 10.389-.748.25a.444.444 0 0 1-.585-.422V4.783c0-.303.297-.517.585-.421l.748.25M5.944 12.055l-.718.3a.445.445 0 0 1-.615-.41v-8.89c0-.317.323-.532.615-.41l.718.3M8.798 1.124l4.631 2.137c.315.145.516.46.516.807v6.862a.89.89 0 0 1-.516.807l-4.631 2.137a.445.445 0 0 1-.631-.403V1.528c0-.325.336-.54.63-.404" })));
});
StackPerspective.displayName = "StackPerspective";
export default StackPerspective;
