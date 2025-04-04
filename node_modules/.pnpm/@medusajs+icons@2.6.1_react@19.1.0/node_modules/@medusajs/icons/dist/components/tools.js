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
const Tools = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.5 4.389a3.33 3.33 0 0 0-2-3.052v3.274H2.833V1.337a3.33 3.33 0 0 0-2 3.052 3.33 3.33 0 0 0 2 3.052v5.615c0 .49.399.889.89.889h.888a.89.89 0 0 0 .889-.89V7.442a3.33 3.33 0 0 0 2-3.052M13.056 7.722v5.334a.89.89 0 0 1-.89.888h-.888a.89.89 0 0 1-.89-.889V7.723M9.5 7.722h4.444M11.722 7.722V1.5M11.722 4.167l.89-1.556-.445-1.555h-.89l-.444 1.555z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Tools.displayName = "Tools";
export default Tools;
