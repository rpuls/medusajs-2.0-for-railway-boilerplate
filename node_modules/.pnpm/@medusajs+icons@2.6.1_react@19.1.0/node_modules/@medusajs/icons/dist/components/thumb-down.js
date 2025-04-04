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
const ThumbDown = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M4.21 8.564c0 .427.154.84.432 1.162l3.79 4.388c.76-.38 1.111-1.269.818-2.065L8.21 9.225h3.913a1.777 1.777 0 0 0 1.718-2.232l-1.059-4a1.78 1.78 0 0 0-1.718-1.323H5.988c-.983 0-1.778.795-1.778 1.778M3.321 1.67H1.988a.89.89 0 0 0-.89.889v5.778c0 .49.399.888.89.888H3.32c.49 0 .889-.397.889-.888V2.559a.89.89 0 0 0-.889-.89" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ThumbDown.displayName = "ThumbDown";
export default ThumbDown;
