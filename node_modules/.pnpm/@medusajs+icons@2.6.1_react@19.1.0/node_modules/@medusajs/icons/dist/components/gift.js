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
const Gift = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.5 4.167v9.777M2.833 2.611c0-.859.697-1.555 1.556-1.555 2.301 0 3.111 3.11 3.111 3.11H4.389a1.556 1.556 0 0 1-1.556-1.555M10.611 4.167H7.5s.81-3.111 3.111-3.111a1.556 1.556 0 0 1 0 3.11M12.167 6.833v5.334c0 .982-.796 1.777-1.778 1.777H4.61a1.777 1.777 0 0 1-1.778-1.777V6.833" }),
            React.createElement("path", { d: "M13.056 4.167H1.944a.89.89 0 0 0-.888.889v.888c0 .491.398.89.888.89h11.112a.89.89 0 0 0 .888-.89v-.888a.89.89 0 0 0-.889-.89" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Gift.displayName = "Gift";
export default Gift;
