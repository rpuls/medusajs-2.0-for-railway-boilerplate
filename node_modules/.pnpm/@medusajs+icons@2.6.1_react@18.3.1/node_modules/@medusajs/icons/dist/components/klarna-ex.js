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
const KlarnaEx = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, fillRule: "evenodd", d: "M14.25 7.5a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0M5.906 4.603H4.658v5.425h1.248zm3.125 0H7.8a3.12 3.12 0 0 1-1.259 2.515l-.48.357 1.869 2.547h1.533l-1.72-2.33a4.3 4.3 0 0 0 1.287-3.09m.797 4.005a.821.821 0 1 1 .912 1.366.821.821 0 0 1-.912-1.366", clipRule: "evenodd" })));
});
KlarnaEx.displayName = "KlarnaEx";
export default KlarnaEx;
