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
const AcademicCapSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M8.823 10.513c-.408.21-.866.32-1.323.32s-.916-.11-1.324-.32L2.611 8.677v3.267c0 1.605 2.46 2.445 4.889 2.445s4.889-.84 4.889-2.445V8.678z" }),
            React.createElement("path", { d: "M14.361 7.7a9.3 9.3 0 0 1 .192-2.134c.016-.116.058-.17.058-.4 0-.534-.295-1.018-.77-1.262L8.213 1.006a1.56 1.56 0 0 0-1.426 0L1.16 3.905c-.475.244-.77.728-.77 1.262s.295 1.018.77 1.263l5.628 2.897a1.56 1.56 0 0 0 1.426 0l4.845-2.495c-.017.304-.04.607-.03.91.021.687.112 1.375.268 2.046a.666.666 0 1 0 1.298-.3 9.2 9.2 0 0 1-.233-1.787" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
AcademicCapSolid.displayName = "AcademicCapSolid";
export default AcademicCapSolid;
