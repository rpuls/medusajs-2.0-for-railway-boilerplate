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
const LightBulb = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7.5 9.5V6.833L5.722 5.056M7.5 6.833l1.778-1.777M5.5 11.722h4" }),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11.944 5.5a4.45 4.45 0 0 0-5.402-4.344c-1.718.358-3.09 1.772-3.408 3.496A4.445 4.445 0 0 0 5.5 9.465v2.702c0 .982.796 1.777 1.778 1.777h.444c.982 0 1.778-.795 1.778-1.777V9.465A4.44 4.44 0 0 0 11.944 5.5M5.5 9.5h4" })));
});
LightBulb.displayName = "LightBulb";
export default LightBulb;
