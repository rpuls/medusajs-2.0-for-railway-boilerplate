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
const ArchiveBox = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M12.611 5.056v6.222c0 .982-.795 1.778-1.778 1.778H4.167a1.777 1.777 0 0 1-1.778-1.778V5.056M13.056 1.944H1.944a.89.89 0 0 0-.888.89v1.333c0 .49.398.888.888.888h11.112a.89.89 0 0 0 .888-.888V2.833a.89.89 0 0 0-.889-.889M5.722 7.722h3.556" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ArchiveBox.displayName = "ArchiveBox";
export default ArchiveBox;
