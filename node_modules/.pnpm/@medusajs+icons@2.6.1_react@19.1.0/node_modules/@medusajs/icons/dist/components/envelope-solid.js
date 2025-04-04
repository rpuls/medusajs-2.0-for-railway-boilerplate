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
const EnvelopeSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.393 7.346a.22.22 0 0 0 .214 0l6.912-3.807a2.44 2.44 0 0 0-2.352-1.817H2.833A2.44 2.44 0 0 0 .483 3.53z" }),
            React.createElement("path", { d: "M8.251 8.513a1.55 1.55 0 0 1-1.502 0L.389 5v5.833a2.446 2.446 0 0 0 2.444 2.445h9.334a2.446 2.446 0 0 0 2.444-2.445V5.011z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
EnvelopeSolid.displayName = "EnvelopeSolid";
export default EnvelopeSolid;
