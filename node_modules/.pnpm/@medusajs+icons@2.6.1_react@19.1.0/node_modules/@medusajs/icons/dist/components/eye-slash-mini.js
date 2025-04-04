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
const EyeSlashMini = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M12.778 5.364c.357.4.645.792.866 1.129.4.607.4 1.406 0 2.013-.905 1.372-2.9 3.66-6.144 3.66q-.732-.002-1.38-.143M3.905 11.095C2.7 10.316 1.86 9.27 1.356 8.506c-.4-.607-.4-1.406 0-2.013.905-1.372 2.9-3.66 6.144-3.66 1.44 0 2.634.45 3.595 1.072" }),
            React.createElement("path", { d: "M9.792 8.35A2.45 2.45 0 0 1 8.35 9.792M5.771 9.229a2.444 2.444 0 1 1 3.458-3.458M1.278 13.722 13.722 1.278" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
EyeSlashMini.displayName = "EyeSlashMini";
export default EyeSlashMini;
