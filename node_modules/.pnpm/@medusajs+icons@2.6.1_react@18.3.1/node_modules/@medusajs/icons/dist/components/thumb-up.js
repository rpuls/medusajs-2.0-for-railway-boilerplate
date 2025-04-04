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
const ThumbUp = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M4.21 6.445c0-.427.154-.84.432-1.162L8.432.895c.76.38 1.111 1.269.818 2.065L8.21 5.783h3.913a1.777 1.777 0 0 1 1.718 2.233l-1.059 4a1.78 1.78 0 0 1-1.718 1.323H5.988a1.777 1.777 0 0 1-1.778-1.778M3.321 5.783H1.988a.89.89 0 0 0-.89.89v5.777c0 .491.399.889.89.889H3.32c.49 0 .889-.398.889-.889V6.672a.89.89 0 0 0-.889-.889" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ThumbUp.displayName = "ThumbUp";
export default ThumbUp;
