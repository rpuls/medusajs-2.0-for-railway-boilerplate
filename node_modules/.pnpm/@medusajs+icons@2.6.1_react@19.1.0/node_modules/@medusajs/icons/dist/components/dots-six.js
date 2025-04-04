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
const DotsSix = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, fillRule: "evenodd", d: "M4.306 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M4.306 2.833a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M4.306 12.167a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M8.306 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M8.306 2.833a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M8.306 12.167a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0", clipRule: "evenodd" })));
});
DotsSix.displayName = "DotsSix";
export default DotsSix;
