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
const Trophy = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7.944 10.389s0 2.611 3.334 3.555H3.722C7.056 13 7.056 10.39 7.056 10.39M4.199 7.5c-3.393 0-3.143-4.666-3.143-4.666h1.988M10.801 7.5c3.394 0 3.143-4.666 3.143-4.666h-1.988" }),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11.944 1.056c-.555 5.805-2.027 9.083-4.222 9.333h-.444c-2.195-.25-3.667-3.528-4.222-9.333z" })));
});
Trophy.displayName = "Trophy";
export default Trophy;
