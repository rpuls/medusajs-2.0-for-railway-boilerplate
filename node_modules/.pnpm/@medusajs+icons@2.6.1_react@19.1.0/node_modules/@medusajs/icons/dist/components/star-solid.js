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
const StarSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { fill: color, d: "M14.578 5.532a.67.67 0 0 0-.538-.453l-4.106-.597L8.097.76c-.224-.455-.971-.455-1.195 0L5.065 4.481.96 5.078a.667.667 0 0 0-.37 1.137L3.562 9.11 2.86 13.2a.667.667 0 0 0 .967.702L7.5 11.973l3.673 1.931a.66.66 0 0 0 .702-.05.67.67 0 0 0 .265-.653l-.702-4.09 2.971-2.895a.67.67 0 0 0 .17-.684z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
StarSolid.displayName = "StarSolid";
export default StarSolid;
