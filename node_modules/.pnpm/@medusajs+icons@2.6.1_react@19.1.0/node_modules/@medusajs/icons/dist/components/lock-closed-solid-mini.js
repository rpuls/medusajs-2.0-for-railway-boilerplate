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
const LockClosedSolidMini = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "M10.389 7.5a.667.667 0 0 1-.667-.667V3.944A2.225 2.225 0 0 0 7.5 1.722a2.225 2.225 0 0 0-2.222 2.222v2.89a.667.667 0 0 1-1.333 0v-2.89A3.56 3.56 0 0 1 7.5.39a3.56 3.56 0 0 1 3.556 3.555v2.89a.667.667 0 0 1-.667.666" }),
        React.createElement("path", { fill: color, d: "M10.833 6.167H4.167A2.446 2.446 0 0 0 1.722 8.61v3.556a2.446 2.446 0 0 0 2.445 2.444h6.666a2.446 2.446 0 0 0 2.445-2.444V8.61a2.446 2.446 0 0 0-2.445-2.444m-2.666 4.666a.667.667 0 0 1-1.334 0v-.889a.667.667 0 0 1 1.334 0z" })));
});
LockClosedSolidMini.displayName = "LockClosedSolidMini";
export default LockClosedSolidMini;
