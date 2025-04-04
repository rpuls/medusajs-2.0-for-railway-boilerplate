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
const JavascriptEx = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, fillRule: "evenodd", d: "M3.75.75h7.5a3 3 0 0 1 3 3v7.5a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3m6.469 10.489c-.633 0-.991-.33-1.266-.778l-1.043.605c.377.742 1.147 1.309 2.338 1.309 1.22 0 2.127-.632 2.127-1.784 0-1.07-.616-1.545-1.706-2.011l-.32-.137c-.552-.238-.79-.394-.79-.778 0-.31.238-.548.614-.548.369 0 .606.155.826.548l1-.64C11.575 6.283 10.988 6 10.172 6c-1.146 0-1.88.73-1.88 1.691 0 1.042.616 1.536 1.542 1.93l.32.136c.586.256.935.411.935.85 0 .367-.34.632-.871.632m-4.974-.008c-.44 0-.624-.302-.826-.659l-1.044.631c.302.64.898 1.17 1.925 1.17 1.137 0 1.916-.604 1.916-1.93v-4.37H5.933v4.353c0 .64-.266.805-.688.805", clipRule: "evenodd" })));
});
JavascriptEx.displayName = "JavascriptEx";
export default JavascriptEx;
