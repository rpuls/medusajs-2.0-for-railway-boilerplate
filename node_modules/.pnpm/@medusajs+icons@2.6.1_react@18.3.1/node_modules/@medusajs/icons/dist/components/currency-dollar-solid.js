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
const CurrencyDollarSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { fill: color, d: "M7.5.389C3.58.389.389 3.579.389 7.5s3.19 7.111 7.111 7.111 7.111-3.19 7.111-7.111S11.421.389 7.5.389m1.871 9.994c-.313.32-.736.538-1.204.645v.25a.667.667 0 0 1-1.334 0v-.247c-.876-.183-1.49-.72-1.748-1.568a.666.666 0 1 1 1.275-.389c.106.346.328.699 1.175.699.355 0 .686-.121.883-.322a.66.66 0 0 0 .194-.49c-.007-.288-.11-.612-1.237-.814-1.758-.314-2.114-1.335-2.17-1.916-.055-.575.104-1.086.46-1.478.318-.349.753-.545 1.17-.653v-.378a.667.667 0 0 1 1.333 0v.358A2.23 2.23 0 0 1 9.73 5.42a.667.667 0 0 1-1.228.518c-.064-.15-.258-.61-.967-.61-.246 0-.683.1-.884.321-.063.07-.145.193-.12.454.013.136.053.549 1.077.732 1.522.273 2.309.977 2.336 2.093a2 2 0 0 1-.573 1.455" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
CurrencyDollarSolid.displayName = "CurrencyDollarSolid";
export default CurrencyDollarSolid;
