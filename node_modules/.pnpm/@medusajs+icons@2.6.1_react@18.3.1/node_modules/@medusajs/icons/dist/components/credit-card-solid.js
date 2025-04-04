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
const CreditCardSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M14.611 4.611a2.446 2.446 0 0 0-2.444-2.444H2.833A2.446 2.446 0 0 0 .39 4.61v.667H14.61zM.389 10.389a2.446 2.446 0 0 0 2.444 2.444h9.334a2.446 2.446 0 0 0 2.444-2.444V6.61H.39zm10.444-1.556h.89a.667.667 0 0 1 0 1.334h-.89a.667.667 0 0 1 0-1.334m-7.555 0h2.666a.667.667 0 0 1 0 1.334H3.278a.667.667 0 0 1 0-1.334" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
CreditCardSolid.displayName = "CreditCardSolid";
export default CreditCardSolid;
