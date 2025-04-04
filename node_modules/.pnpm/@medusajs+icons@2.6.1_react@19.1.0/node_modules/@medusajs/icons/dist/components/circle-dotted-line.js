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
const CircleDottedLine = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M3.933 2.132a6.4 6.4 0 0 1 2.322-.956M1.17 6.283a6.4 6.4 0 0 1 .97-2.362M3.933 12.868c.691.46 1.477.791 2.322.956M1.17 8.717c.165.86.5 1.66.97 2.362M8.745 1.176c.845.165 1.63.496 2.322.956M12.86 3.921a6.4 6.4 0 0 1 .97 2.362M8.745 13.824a6.4 6.4 0 0 0 2.322-.956M12.86 11.079c.47-.703.805-1.502.97-2.362" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
CircleDottedLine.displayName = "CircleDottedLine";
export default CircleDottedLine;
