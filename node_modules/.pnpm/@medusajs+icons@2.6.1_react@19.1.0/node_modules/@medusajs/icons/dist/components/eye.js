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
const Eye = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.5 12.833c-3.558 0-5.725-2.48-6.7-3.96a2.49 2.49 0 0 1 0-2.747c.975-1.48 3.142-3.96 6.7-3.96s5.725 2.48 6.7 3.96a2.49 2.49 0 0 1 0 2.746c-.975 1.48-3.142 3.961-6.7 3.961m0-9.333c-2.934 0-4.76 2.106-5.588 3.36a1.18 1.18 0 0 0 0 1.28C2.74 9.393 4.566 11.5 7.5 11.5s4.76-2.106 5.588-3.36a1.18 1.18 0 0 0 0-1.28C12.26 5.607 10.434 3.5 7.5 3.5" }),
            React.createElement("path", { d: "M7.5 10.389a2.889 2.889 0 1 0 0-5.778 2.889 2.889 0 0 0 0 5.778" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Eye.displayName = "Eye";
export default Eye;
